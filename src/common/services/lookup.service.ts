import { Injectable } from '@nestjs/common';
import type { TipoInsumo } from '@prisma/client';
import { AppError } from '../../lib/errors.js';
import { normalize } from '../../lib/utils.js';

type PrismaModel = {
  findMany(args?: unknown): Promise<unknown[]>;
  findFirst(args?: unknown): Promise<unknown>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
};

export type LookupInput = { nome: string; [campo: string]: unknown };
export type LookupAtualizacao = { nome?: string; [campo: string]: unknown };

export interface LookupCrud {
  listar: () => Promise<unknown[]>;
  criar: (data: LookupInput) => Promise<unknown>;
  atualizar: (id: number, data: LookupAtualizacao) => Promise<unknown>;
  desativar: (id: number) => Promise<unknown>;
  remover: (id: number) => Promise<unknown>;
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
      tipoInsumo?: TipoInsumo;
    },
  ): LookupCrud {
    const label = opts.labelSingular;
    const orderBy = opts.orderBy || 'nome';
    const escopo = opts.tipoInsumo
      ? { tipoInsumo: opts.tipoInsumo }
      : undefined;

    return {
      listar: () =>
        model.findMany({
          where: { ativo: true, ...escopo },
          orderBy: { [orderBy]: 'asc' },
        }),

      criar: async (data: LookupInput) => {
        const nomeUpper =
          typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
        const exists = await model.findFirst({
          where: { nome: normalize(nomeUpper), ...escopo },
        });
        if (exists)
          throw new AppError(
            409,
            opts.duplicateMessage?.(nomeUpper) ?? `${label} já cadastrado`,
          );
        return model.create({
          data: { ...data, nome: nomeUpper, ...escopo },
        });
      },

      atualizar: async (id: number, data: LookupAtualizacao) => {
        if (data.nome) {
          data.nome =
            typeof data.nome === 'string' ? data.nome.toUpperCase() : data.nome;
          const exists = await model.findFirst({
            where: { nome: normalize(data.nome), NOT: { id }, ...escopo },
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

      remover: async (id: number) => {
        try {
          return await model.delete({ where: { id } });
        } catch (err: any) {
          if (err?.code === 'P2003') {
            throw new AppError(
              409,
              `Não é possível remover este item (${label.toLowerCase()}) pois ele possui vínculos com outros registros no sistema.`,
            );
          }
          throw err;
        }
      },
    };
  }
}
