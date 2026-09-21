import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { EmailService } from '../email/email.service.js';
import { AppError } from '../lib/errors.js';
import { notificarPapeis } from '../lib/notificacao.js';
import { verificarTurnstile } from '../lib/turnstile.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { WhatsAppService } from '../whatsapp/whatsapp.service.js';
import type {
  AlterarSenhaDto,
  CadastrarDto,
  LoginDto,
  RecuperarSenhaDto,
  RedefinirSenhaDto,
} from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly whatsappService: WhatsAppService,
    private readonly emailService: EmailService,
  ) {}

  async login(dto: LoginDto) {
    let user;
    if (dto.email.includes('@')) {
      user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
    } else {
      const telefoneLimpo = dto.email.replace(/\D/g, '');
      user = await this.prisma.user.findFirst({
        where: { telefone: { contains: telefoneLimpo } },
      });
    }
    if (!user) throw new UnauthorizedException('E-mail/telefone ou senha inválidos');

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
    const nomeTrimmed = dto.nome.trim();
    const existenteNome = await this.prisma.user.findFirst({
      where: { nome: { equals: nomeTrimmed, mode: 'insensitive' } },
    });
    if (existenteNome) throw new AppError(409, 'Nome já cadastrado');

    const telefoneLimpo = dto.telefone.replace(/\D/g, '');
    const existenteTelefone = await this.prisma.user.findFirst({
      where: { telefone: { contains: telefoneLimpo } },
    });
    if (existenteTelefone) throw new AppError(409, 'Telefone já cadastrado');

    if (dto.email) {
      const existenteEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existenteEmail) throw new AppError(409, 'E-mail já cadastrado');
    }

    if (config.turnstileSecret && !config.isDev) {
      await verificarTurnstile(dto.turnstileToken as string);
    }

    let papelId: number;
    const papelExistente = await this.prisma.papelRbac.findFirst({
      where: { nome: 'CLIENTE' },
    });
    if (papelExistente) {
      papelId = papelExistente.id;
    } else {
      const novoPapel = await this.prisma.papelRbac.create({
        data: { nome: 'CLIENTE', descricao: 'Cliente padrão' },
      });
      papelId = novoPapel.id;
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const novoUser = await tx.user.create({
        data: {
          nome: dto.nome,
          email: dto.email || null,
          telefone: dto.telefone,
          senhaHash,
        },
      });
      await tx.usuarioPapel.create({ data: { userId: novoUser.id, papelId } });
      return novoUser;
    });

    await notificarPapeis(this.prisma, ['CLIENTE'], {
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
    let user;
    if (dto.canal === 'email' && dto.email) {
      user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    } else if (dto.canal === 'whatsapp' && dto.telefone) {
      const telefoneLimpo = dto.telefone.replace(/\D/g, '');
      user = await this.prisma.user.findFirst({
        where: { telefone: { contains: telefoneLimpo } },
      });
    }

    if (!user) {
      return {
        ok: true,
        mensagem:
          'Se as credenciais estiverem corretas, um código de recuperação será enviado',
      };
    }

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiraEm = new Date(Date.now() + config.resetTokenExpiresMin * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiraEm,
      },
    });

    if (dto.canal === 'email' && dto.email) {
      await this.emailService.enviarLinkRecuperacao(dto.email, token, user.nome);
    } else if (dto.canal === 'whatsapp' && dto.telefone) {
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      await this.whatsappService.enviarCodigoRecuperacao(dto.telefone, codigo);
    }

    return {
      ok: true,
      mensagem:
        'Se as credenciais estiverem corretas, um código de recuperação será enviado',
      ...(config.isDev && dto.canal === 'email' ? { devToken: token } : {}),
    };
  }

  async redefinirSenha(dto: RedefinirSenhaDto) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
    });

    if (!resetToken) throw new AppError(400, 'Token inválido');
    if (resetToken.usadoEm) throw new AppError(400, 'Token já utilizado');
    if (new Date() > resetToken.expiraEm) throw new AppError(400, 'Token expirado');

    const novaSenhaHash = await bcrypt.hash(dto.senha, 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { senhaHash: novaSenhaHash },
      });
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usadoEm: new Date() },
      });
    });

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
