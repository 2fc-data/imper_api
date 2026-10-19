import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const p = new PrismaClient();

const SENHA_HASH = bcrypt.hashSync('123456', 10);
const DDD = '35';

type Colaborador = {
  nome: string;
  telefone: string;
  cpfCnpj?: string;
  rg?: string;
};

const COLABORADORES: Colaborador[] = [
  { nome: 'Bruno Luís Veronesi', telefone: '999446285', cpfCnpj: '09102916673' },
  { nome: 'Cláudio Casiano da Silva', telefone: '999572889' },
  { nome: 'Derli Elias da Silva', telefone: '988858699', cpfCnpj: '04870124610', rg: 'MG-12.178.769' },
  { nome: 'Dioe Carlos de Carvalho', telefone: '998225542', cpfCnpj: '12491827603', rg: 'MG-17.143.329' },
  { nome: 'Durian Ramos da Silva', telefone: '999459476', cpfCnpj: '08413856612', rg: 'MG-15.784.869' },
  { nome: 'Giovani Pereira Nogueira', telefone: '988005812', cpfCnpj: '66834023615' },
  { nome: 'Jeferson Acácio da Silva', telefone: '997499088', cpfCnpj: '12082638626', rg: 'MG17748803' },
  { nome: 'João Carlos Viana', telefone: '999703258', cpfCnpj: '69708177172' },
  { nome: 'Leandro José Dias', telefone: '999110345', cpfCnpj: '05891142635', rg: 'MG-13.384.751' },
  { nome: 'Leôncio Quiciri Junior', telefone: '999897364', cpfCnpj: '94835934687', rg: 'MG-8.230.175' },
  { nome: 'Luan Gonçalves', telefone: '997414753', cpfCnpj: '11730977677', rg: 'MG.17.303.373' },
  { nome: 'Marcos Antonio I Oliveira', telefone: '988127107', cpfCnpj: '41236483634' },
  { nome: 'Vitor da Cruz', telefone: '999189804', cpfCnpj: '31437974600' },
  { nome: 'Waldivino da Silva', telefone: '999133600' },
];

function formatarTelefone(noveDigitos: string): string {
  const d = noveDigitos.replace(/\D/g, '');
  if (d.length !== 9) {
    throw new Error(`Telefone inválido (esperado 9 dígitos): ${noveDigitos}`);
  }
  return `(${DDD}) ${d.slice(0, 5)}-${d.slice(5)}`;
}

async function main() {
  const papel = await p.papelRbac.findUnique({ where: { nome: 'COLABORADOR' } });
  if (!papel) throw new Error('Perfil COLABORADOR não encontrado (rode db:seed-rbac)');

  const cargo = await p.cargo.findFirst({ where: { nome: 'Colaboradores' } });
  if (!cargo) throw new Error('Cargo "Colaboradores" não encontrado (rode db:seed-rbac)');

  for (const c of COLABORADORES) {
    const telefone = formatarTelefone(c.telefone);
    const cpf = c.cpfCnpj ?? null;
    const rg = c.rg?.trim() || null;

    const existente = cpf
      ? await p.user.findUnique({ where: { cpfCnpj: cpf } })
      : await p.user.findFirst({ where: { nome: c.nome } });

    const dados = {
      nome: c.nome,
      telefone,
      cpfCnpj: cpf,
      rg,
      cargoId: cargo.id,
      senhaHash: SENHA_HASH,
      ativo: true,
    };
    const user = existente
      ? await p.user.update({ where: { id: existente.id }, data: dados, select: { id: true, nome: true } })
      : await p.user.create({ data: dados, select: { id: true, nome: true } });

    await p.usuarioPapel.createMany({
      data: [{ userId: user.id, papelId: papel.id }],
      skipDuplicates: true,
    });

    console.log(`✅ ${user.nome} (id ${user.id}) → ${telefone}`);
  }

  console.log(`\n🔑 Login por telefone — senha: 123456 (${COLABORADORES.length} colaboradores)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
