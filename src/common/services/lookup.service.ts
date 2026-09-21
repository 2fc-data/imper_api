import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AppError } from '../../lib/errors.js';
import { normalize } from '../../lib/utils.js';

type PrismaModel = {
  findMany: (args?: any) => Promise<any[]>;
  findFirst: (args: any) => Promise<any>;
  create: (args: { data: any }) => Promise<any>;
  update: (args: { where: { id: number }; data: any }) => Promise<any>;
};

export interface LookupCrud {
  listar: () => Promise<any[]>;
  criar: (data: any) => Promise<any>;
  atualizar: (id: number, data: any) => Promise<any>;
  desativar: (id: number) => Promise<any>;
}

@Injectable()
export class LookupService {
  constructor(private readonly prisma: PrismaService) {}

  criarCrud(
    model: PrismaModel,
    opts: {
      labelSingular: string;
      labelPlural?: string;
      orderBy?: string;
      duplicateMessage?: (nome: string) => string;
    },
  ): LookupCrud {
    const label = opts.labelSingular;
    const orderBy = opts.orderBy || 'nome';

    return {
      listar: () =>
        model.findMany({
          where: { ativo: true },
          orderBy: { [orderBy]: 'asc' },
        }),

      criar: async (data: any) => {
        const nomeUpper =
          typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
        const exists = await model.findFirst({
          where: { nome: normalize(nomeUpper) },
        });
        if (exists)
          throw new AppError(
            409,
            opts.duplicateMessage?.(nomeUpper) ?? `${label} já cadastrado`,
          );
        return model.create({ data: { ...data, nome: nomeUpper } });
      },

      atualizar: async (id: number, data: any) => {
        if (data.nome) {
          data.nome =
            typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
          const exists = await model.findFirst({
            where: { nome: normalize(data.nome), NOT: { id } },
          });
          if (exists)
            throw new AppError(
              409,
              opts.duplicateMessage?.(data.nome) ?? `${label} já cadastrado`,
            );
        }
        return model.update({ where: { id }, data });
      },

      desativar: (id: number) =>
        model.update({ where: { id }, data: { ativo: false } }),
    };
  }
}
