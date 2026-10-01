interface UsuarioPapelComPapel {
  papel: { nome: string };
}

export function papelPrincipal(
  userPapeis: UsuarioPapelComPapel[],
): string | null {
  const staff = userPapeis.find((up) => up.papel.nome !== 'CLIENTE');
  return (staff ?? userPapeis[0])?.papel.nome ?? null;
}
