import { Prisma } from '@prisma/client';
import { AppError } from './errors.js';

const MAX_TENTATIVAS = 3;

export function calcularProximoCodigo(
  codigos: Array<{ codigo: string }>,
  prefixo: string,
  tamanho: number,
): string {
  let maior = 0;

  for (const { codigo } of codigos) {
    if (!codigo.startsWith(prefixo)) continue;
    const sufixo = codigo.slice(prefixo.length);
    if (!/^\d+$/.test(sufixo)) continue;
    maior = Math.max(maior, Number(sufixo));
  }

  return `${prefixo}${String(maior + 1).padStart(tamanho, '0')}`;
}

export function ehColisaoDeCodigo(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== 'P2002') return false;

  const alvo = (error.meta as { target?: unknown } | undefined)?.target;
  const target = Array.isArray(alvo) ? alvo.join(',') : String(alvo ?? '');

  if (target) return target.toLowerCase().includes('codigo');
  return error.message.toLowerCase().includes('codigo');
}

export async function criarComCodigoSequencial<T>(
  gerarCodigo: () => Promise<string>,
  criar: (codigo: string) => Promise<T>,
  mensagemErro: string,
): Promise<T> {
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa += 1) {
    const codigo = await gerarCodigo();
    try {
      return await criar(codigo);
    } catch (error) {
      if (!ehColisaoDeCodigo(error)) throw error;
    }
  }

  throw new AppError(409, mensagemErro);
}
