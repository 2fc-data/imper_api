import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('cadastro')
  @HttpCode(201)
  cadastrar(@Body() dto: CadastrarDto) {
    return this.authService.cadastrar(dto);
  }

  @Public()
  @Post('recuperar-senha')
  recuperarSenha(@Body() dto: RecuperarSenhaDto) {
    return this.authService.recuperarSenha(dto);
  }

  @Public()
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
  getMe(@Request() req: { user: unknown }) {
    return req.user;
  }
}
