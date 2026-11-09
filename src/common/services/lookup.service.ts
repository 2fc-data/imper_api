import { Injectable } from '@nestjs/common';
import { AppError } from '../../lib/errors.js';
import { normalize } from '../../lib/utils.js';

type PrismaModel = {
  findMany(args?: unknown): Promise<unknown[]>;
  findFirst(args?: unknown): Promise<unknown>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
};

export type LookupInput = { nome: string; [campo: string]: unknown };
export type LookupAtualizacao = { nome?: string; [campo: string]: unknown };

export interface LookupCrud {
  listar: () => Promise<unknown[]>;
  criar: (data: LookupInput) => Promise<unknown>;
  atualizar: (id: number, data: LookupAtualizacao) => Promise<unknown>;
  desativar: (id: number) => Promise<unknown>;
}

@Injectable()
export class LookupService {
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

      criar: async (data: LookupInput) => {
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

      atualizar: async (id: number, data: LookupAtualizacao) => {
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
