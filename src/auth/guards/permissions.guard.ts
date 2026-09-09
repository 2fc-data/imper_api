import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PAPEL_ENUM_COMPAT } from '../constants/papeis-compat.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Sem autenticação');
    }

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
    const nomesPapeis = new Set<string>();
    for (const up of userPapeis) {
      nomesPapeis.add(up.papel.nome);
      for (const pp of up.papel.permissoes) {
        permissoes.add(pp.permissao.chave);
      }
    }

    const temPermissao = requiredPermissions.some((p) => {
      if (PAPEL_ENUM_COMPAT[p]) {
        return nomesPapeis.has(p);
      }
      return permissoes.has(p);
    });

    if (!temPermissao) {
      throw new ForbiddenException('Sem permissão para esta ação');
    }

    return true;
  }
}
