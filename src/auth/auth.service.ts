import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { AppError } from '../lib/errors.js';
import { notificarPapeis } from '../lib/notificacao.js';
import { verificarTurnstile } from '../lib/turnstile.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AlterarSenhaDto,
  CadastrarDto,
  LoginDto,
  RecuperarSenhaDto,
  RedefinirSenhaDto,
} from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('E-mail ou senha inválidos');

    const senhaValida = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!senhaValida)
      throw new UnauthorizedException('E-mail ou senha inválidos');

    const userPapeis = await this.prisma.usuarioPapel.findMany({
      where: { userId: user.id },
      include: {
        papel: {
          include: {
            permissoes: { include: { permissao: true } },
          },
        },
      },
    });

    const permissoes = new Set<string>();
    for (const up of userPapeis) {
      for (const pp of up.papel.permissoes) {
        permissoes.add(pp.permissao.chave);
      }
    }

    const papelNome = userPapeis[0]?.papel.nome ?? 'ATENDENTE';
    const permissoesArr = Array.from(permissoes);

    const payload = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      papel: papelNome,
      permissoes: permissoesArr,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        papel: papelNome,
        permissoes: permissoesArr,
      },
    };
  }

  async cadastrar(dto: CadastrarDto) {
    const existente = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existente) throw new AppError(409, 'E-mail já cadastrado');

    if (config.turnstileSecret && !config.isDev) {
      await verificarTurnstile(dto.turnstileToken as string);
    }

    let papelId: number;
    const papelExistente = await this.prisma.papelRbac.findFirst({
      where: { nome: 'ATENDENTE' },
    });
    if (papelExistente) {
      papelId = papelExistente.id;
    } else {
      const novoPapel = await this.prisma.papelRbac.create({
        data: { nome: 'ATENDENTE', descricao: 'Usuário padrão' },
      });
      papelId = novoPapel.id;
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const novoUser = await tx.user.create({
        data: {
          nome: dto.nome,
          email: dto.email,
          telefone: dto.telefone ?? null,
          senhaHash,
        },
      });
      await tx.usuarioPapel.create({ data: { userId: novoUser.id, papelId } });
      return novoUser;
    });

    await notificarPapeis(['ATENDENTE'], {
      titulo: 'Bem-vindo!',
      mensagem: `Bem-vindo ao sistema, ${user.nome}!`,
      link: '/login',
    });

    const payload = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      papel: 'ATENDENTE',
      permissoes: [],
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        papel: 'ATENDENTE',
        permissoes: [],
      },
    };
  }

  async recuperarSenha(dto: RecuperarSenhaDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new AppError(404, 'Usuário não encontrado');
    return {
      ok: true,
      mensagem:
        'Se as credenciais estiverem corretas, um e-mail de reset será enviado',
    };
  }

  async redefinirSenha(dto: RedefinirSenhaDto) {
    await bcrypt.hash(dto.senha, 10);
    return { ok: true };
  }

  async alterarSenha(dto: AlterarSenhaDto, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'Usuário não encontrado');

    const senhaCorreta = await bcrypt.compare(dto.senhaAtual, user.senhaHash);
    if (!senhaCorreta) throw new AppError(400, 'Senha atual incorreta');

    const novaSenhaHash = await bcrypt.hash(dto.novaSenha, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { senhaHash: novaSenhaHash },
    });
    return { ok: true };
  }

  async buscarPermissoes(userId: number) {
    const userPapeis = await this.prisma.usuarioPapel.findMany({
      where: { userId },
      include: {
        papel: {
          include: { permissoes: { include: { permissao: true } } },
        },
      },
    });

    const permissoes = new Set<string>();
    for (const up of userPapeis) {
      for (const pp of up.papel.permissoes) {
        permissoes.add(pp.permissao.chave);
      }
    }
    return Array.from(permissoes);
  }
}
