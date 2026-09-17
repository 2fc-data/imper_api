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
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import type {
  AlterarSenhaDto,
  CadastrarDto,
  LoginDto,
  RecuperarSenhaDto,
  RedefinirSenhaDto,
} from './dto/auth.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { ThrottlerGuard } from '../throttler/throttler.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

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
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @SetMetadata('throttle', { ttl: 60_000, limit: 3 })
  @Post('cadastro')
  @HttpCode(201)
  cadastrar(@Body() dto: CadastrarDto) {
    return this.authService.cadastrar(dto);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @SetMetadata('throttle', { ttl: 60_000, limit: 3 })
  @Post('recuperar-senha')
  recuperarSenha(@Body() dto: RecuperarSenhaDto) {
    return this.authService.recuperarSenha(dto);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @SetMetadata('throttle', { ttl: 60_000, limit: 5 })
  @Post('redefinir-senha')
  redefinirSenha(@Body() dto: RedefinirSenhaDto) {
    return this.authService.redefinirSenha(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('alterar-senha')
  alterarSenha(
    @Body() dto: AlterarSenhaDto,
    @Request() req: { user: { id: number } },
  ) {
    return this.authService.alterarSenha(dto, req.user.id);
  }

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
            papel: { select: { nome: true } },
          },
          take: 1,
        },
      },
    });
    if (!user) return req.user;
    const { enderecos, papeis, ...rest } = user;
    return {
      ...rest,
      papel: papeis[0]?.papel.nome ?? null,
      endereco: enderecos[0] ?? null,
    };
  }
}
