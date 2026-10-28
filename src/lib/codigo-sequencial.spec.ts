import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import {
  calcularProximoCodigo,
  criarComCodigoSequencial,
  ehColisaoDeCodigo,
} from './codigo-sequencial.js';

function erroP2002(target: string[] | string) {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { target },
  });
}

describe('calcularProximoCodigo', () => {
  it('usa o maior sufixo numérico existente', () => {
    expect(
      calcularProximoCodigo(
        [{ codigo: 'EQP-002' }, { codigo: 'EQP-010' }, { codigo: 'EQP-001' }],
        'EQP-',
        3,
      ),
    ).toBe('EQP-011');
  });

  it('inicia em 1 sem códigos válidos', () => {
    expect(
      calcularProximoCodigo(
        [{ codigo: 'V001' }, { codigo: 'EQP-ABC' }],
        'EQP-',
        3,
      ),
    ).toBe('EQP-001');
  });

  it('respeita o tamanho do prefixo', () => {
    expect(calcularProximoCodigo([{ codigo: 'VCL-09' }], 'VCL-', 2)).toBe(
      'VCL-10',
    );
  });
});

describe('ehColisaoDeCodigo', () => {
  it('detecta P2002 no campo codigo', () => {
    expect(ehColisaoDeCodigo(erroP2002(['codigo']))).toBe(true);
  });

  it('ignora outros campos e outros erros', () => {
    expect(ehColisaoDeCodigo(erroP2002(['placa']))).toBe(false);
    expect(ehColisaoDeCodigo(new Error('falha'))).toBe(false);
  });
});

describe('criarComCodigoSequencial', () => {
  it('tenta novamente após colisão de código', async () => {
    const gerarCodigo = vi
      .fn()
      .mockResolvedValueOnce('EQP-001')
      .mockResolvedValueOnce('EQP-002');
    const criar = vi
      .fn()
      .mockRejectedValueOnce(erroP2002(['codigo']))
      .mockResolvedValueOnce({ id: 2, codigo: 'EQP-002' });

    const result = await criarComCodigoSequencial(
      gerarCodigo,
      criar,
      'Não foi possível gerar o código',
    );

    expect(result).toEqual({ id: 2, codigo: 'EQP-002' });
    expect(gerarCodigo).toHaveBeenCalledTimes(2);
    expect(criar).toHaveBeenCalledTimes(2);
  });

  it('lança 409 após três colisões', async () => {
    const gerarCodigo = vi.fn().mockResolvedValue('EQP-001');
    const criar = vi.fn().mockRejectedValue(erroP2002(['codigo']));

    await expect(
      criarComCodigoSequencial(
        gerarCodigo,
        criar,
        'Não foi possível gerar o código',
      ),
    ).rejects.toThrow('Não foi possível gerar o código');
    expect(criar).toHaveBeenCalledTimes(3);
  });

  it('propaga erros que não são colisão de código', async () => {
    const erro = new Error('falha inesperada');
    const criar = vi.fn().mockRejectedValue(erro);

    await expect(
      criarComCodigoSequencial(
        async () => 'EQP-001',
        criar,
        'Não foi possível gerar o código',
      ),
    ).rejects.toBe(erro);
    expect(criar).toHaveBeenCalledTimes(1);
  });
});
