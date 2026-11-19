import { BadRequestException } from '@nestjs/common';
import type { AcaoPecaManutencao, OrigemPecaManutencao } from '@prisma/client';

export type PecaManutencaoInput = {
  descricao: string;
  acao: AcaoPecaManutencao;
  origem?: OrigemPecaManutencao | null;
  valor?: number | string | null;
};

export type PecaManutencaoNormalizada = {
  descricao: string;
  acao: AcaoPecaManutencao;
  origem: OrigemPecaManutencao | null;
  valor: number;
};

export function normalizarPecas(
  pecas: PecaManutencaoInput[] | undefined,
): PecaManutencaoNormalizada[] | undefined {
  if (pecas === undefined) return undefined;

  const normalizadas: PecaManutencaoNormalizada[] = [];
  for (const peca of pecas) {
    const descricao = (peca.descricao ?? '').trim();
    if (!descricao) continue;

    if (!peca.acao) {
      throw new BadRequestException(`Informe a ação da peça "${descricao}"`);
    }
    if (peca.acao === 'TROCADA' && !peca.origem) {
      throw new BadRequestException(
        `Informe a origem da peça trocada "${descricao}"`,
      );
    }

    normalizadas.push({
      descricao,
      acao: peca.acao,
      origem: peca.acao === 'CONSERTADA' ? null : (peca.origem ?? null),
      valor: peca.valor != null ? Number(peca.valor) : 0,
    });
  }

  return normalizadas;
}

export function somarPecas(pecas: PecaManutencaoNormalizada[]): number {
  return pecas.reduce((total, peca) => total + peca.valor, 0);
}

export function parseDataSaida(
  dataEntrada: string | number | Date | undefined,
  dataSaida: string | number | null | undefined,
): Date | null | undefined {
  if (dataSaida === undefined) return undefined;
  if (dataSaida === null || dataSaida === '') return null;

  const entrada = dataEntrada ? new Date(dataEntrada) : undefined;
  const saida = new Date(dataSaida);
  if (entrada && saida < entrada) {
    throw new BadRequestException(
      'A data de saída não pode ser anterior à data de entrada',
    );
  }

  return saida;
}
