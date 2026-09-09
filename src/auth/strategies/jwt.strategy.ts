import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../../config.js';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface JwtPayload {
  id: number;
  nome: string;
  email: string;
  permissoes: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const userPapeis = await this.prisma.usuarioPapel.findMany({
      where: { userId: user.id },
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

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      papel: userPapeis[0]?.papel.nome ?? 'ATENDENTE',
      permissoes: Array.from(permissoes),
    };
  }
}
