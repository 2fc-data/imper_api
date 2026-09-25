export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function moValorTotal(l: {
  moPessoas?: number | null;
  moHoras?: number | null;
  moValorHora?: number | null;
}): number {
  if (l.moPessoas == null || l.moHoras == null || l.moValorHora == null) {
    return 0;
  }
  return round2(l.moPessoas * l.moHoras * l.moValorHora);
}

export function materiaisValor(
  m: { quantidade: number; custoUnitario: number }[],
): number {
  return round2(m.reduce((acc, x) => acc + x.quantidade * x.custoUnitario, 0));
}

export function linhaValorTotal(
  l: {
    moPessoas?: number | null;
    moHoras?: number | null;
    moValorHora?: number | null;
  },
  mats: { quantidade: number; custoUnitario: number }[],
): number {
  return round2(moValorTotal(l) + materiaisValor(mats));
}

export function valorTotalOrcamento(p: {
  areaM2?: number | null;
  valorM2?: number | null;
  linhas: number[];
}): number {
  const base = p.areaM2 != null && p.valorM2 != null ? p.areaM2 * p.valorM2 : 0;
  return round2(base + p.linhas.reduce((a, b) => a + b, 0));
}
