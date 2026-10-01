import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ThrottlerGuard } from '../throttler/throttler.guard.js';
import { AuthService } from './auth.service.js';
import { Portal } from './decorators/portal.decorator.js';
import { Public } from './decorators/public.decorator.js';
import {
  type AlterarSenhaDto,
  alterarSenhaSchema,
  type CadastrarDto,
  cadastrarSchema,
  type LoginDto,
  loginSchema,
  type RecuperarSenhaDto,
  type RedefinirSenhaDto,
  recuperarSenhaSchema,
  redefinirSenhaSchema,
} from './dto/auth.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @SetMetadata('throttle', { ttl: 60_000, limit: 5 })
  @Post('login')
  login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @SetMetadata('throttle', { ttl: 60_000, limit: 3 })
  @Post('cadastro')
  @HttpCode(201)
  cadastrar(@Body(new ZodValidationPipe(cadastrarSchema)) dto: CadastrarDto) {
    return this.authService.cadastrar(dto);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @SetMetadata('throttle', { ttl: 60_000, limit: 3 })
  @Post('recuperar-senha')
  recuperarSenha(
    @Body(new ZodValidationPipe(recuperarSenhaSchema)) dto: RecuperarSenhaDto,
  ) {
    return this.authService.recuperarSenha(dto);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @SetMetadata('throttle', { ttl: 60_000, limit: 5 })
  @Post('redefinir-senha')
  redefinirSenha(
    @Body(new ZodValidationPipe(redefinirSenhaSchema)) dto: RedefinirSenhaDto,
  ) {
    return this.authService.redefinirSenha(dto);
  }

  @Portal()
  @UseGuards(JwtAuthGuard)
  @Post('alterar-senha')
  alterarSenha(
    @Body(new ZodValidationPipe(alterarSenhaSchema)) dto: AlterarSenhaDto,
    @Request() req: { user: { id: number } },
  ) {
    return this.authService.alterarSenha(dto, req.user.id);
  }

  @Portal()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: { user: { id: number } }) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpfCnpj: true,
        enderecos: {
          select: {
            id: true,
            logradouro: true,
            numero: true,
            complemento: true,
            bairro: true,
            cidade: true,
            estado: true,
            cep: true,
          },
          take: 1,
        },
        papeis: {
          select: {
            papel: {
              select: {
                nome: true,
                permissoes: {
                  select: { permissao: { select: { chave: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!user) return req.user;
    const { enderecos, papeis, ...rest } = user;
    const papelNome = papeis[0]?.papel.nome ?? null;
    const permissoes = new Set<string>();
    for (const up of papeis) {
      for (const pp of up.papel.permissoes) {
        permissoes.add(pp.permissao.chave);
      }
    }
    return {
      ...rest,
      papel: papelNome,
      permissoes: Array.from(permissoes),
      endereco: enderecos[0] ?? null,
    };
  }
}
