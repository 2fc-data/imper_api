/**
 * Seed de Usuários Colaboradores
 * Cadastra os 30 colaboradores operacionais e administrativos com:
 * - Papel: 'COLABORADOR'
 * - Senha: 'senha123' (hash bcrypt)
 * - CPF, RG, Telefone com DDD e Cargo devidamente normalizados.
 *
 * Idempotente: pode ser executado múltiplas vezes com segurança.
 *
 * Execução: npx tsx prisma/seed-colaboradores.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SENHA_HASH = bcrypt.hashSync('senha123', 10);

interface ColaboradorInput {
  nome: string;
  email: string;
  telefone: string | null;
  cpfCnpj: string | null;
  rg: string | null;
  cargo: string;
}

const COLABORADORES: ColaboradorInput[] = [
  {
    "nome": "Ana Paula Silveira Corrêa",
    "email": "ana.paula.silveira.correa@imper.local",
    "telefone": "(35) 99102-8118",
    "cpfCnpj": "04589624656",
    "rg": "MG11019541",
    "cargo": "Almoxarife"
  },
  {
    "nome": "Andre Luiz Inacio",
    "email": "andre.luiz.inacio@imper.local",
    "telefone": "(35) 99967-3975",
    "cpfCnpj": "06984589665",
    "rg": "MG-12166.929",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Derli Elias da Silva",
    "email": "derli.elias.da.silva@imper.local",
    "telefone": "(35) 98885-8699",
    "cpfCnpj": "04870124610",
    "rg": "MG-12.178.769",
    "cargo": "Impermeabilizador"
  },
  {
    "nome": "Dioe Carlos de Carvalho",
    "email": "dioe.carlos.de.carvalho@imper.local",
    "telefone": "(35) 99822-5542",
    "cpfCnpj": "12491827603",
    "rg": "MG-17.143.329",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Durian Ramos da Silva",
    "email": "durian.ramos.da.silva@imper.local",
    "telefone": "(35) 99945-9476",
    "cpfCnpj": "08413856612",
    "rg": "MG-15.784.869",
    "cargo": "Impermeabilizador"
  },
  {
    "nome": "Giovani Pereira Nogueira",
    "email": "giovani.pereira.nogueira@imper.local",
    "telefone": "(35) 98800-5812",
    "cpfCnpj": "66834023615",
    "rg": "27.895.890-4",
    "cargo": "Pintor"
  },
  {
    "nome": "Jeferson Acácio da Silva",
    "email": "jeferson.acacio.da.silva@imper.local",
    "telefone": "(35) 99749-9088",
    "cpfCnpj": "12082638626",
    "rg": "MG17748803",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "João Carlos Viana",
    "email": "joao.carlos.viana@imper.local",
    "telefone": "(35) 99970-3258",
    "cpfCnpj": "69708177172",
    "rg": "32.543.598-4",
    "cargo": "Impermeabilizador"
  },
  {
    "nome": "Leandro Moreira da Silva",
    "email": "leandro.moreira.da.silva@imper.local",
    "telefone": null,
    "cpfCnpj": "10769329675",
    "rg": "24.342.282",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Leila Sandra Rangel",
    "email": "leila.sandra.rangel@imper.local",
    "telefone": "(35) 98818-7318",
    "cpfCnpj": "20182303870",
    "rg": "24.552.515-4",
    "cargo": "Secretária"
  },
  {
    "nome": "Leôncio Quiciri Junior",
    "email": "leoncio.quiciri.junior@imper.local",
    "telefone": "(35) 99989-7364",
    "cpfCnpj": "94835934687",
    "rg": "MG-8.230.175",
    "cargo": "Impermeabilizador"
  },
  {
    "nome": "Luan Gonçalves",
    "email": "luan.goncalves@imper.local",
    "telefone": "(35) 99741-4753",
    "cpfCnpj": "11730977677",
    "rg": "MG.17.303.373",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Marco Antonio Machado de Lima",
    "email": "marco.antonio.machado.de.lima@imper.local",
    "telefone": "(35) 99732-7273",
    "cpfCnpj": "05912976807",
    "rg": "MG-13.268.450",
    "cargo": "Pedreiro"
  },
  {
    "nome": "Marcos Antonio Inês de Oliveira",
    "email": "marcos.antonio.ines.de.oliveira@imper.local",
    "telefone": "(35) 98812-7107",
    "cpfCnpj": "41236483634",
    "rg": "M-331.2955",
    "cargo": "Pedreiro"
  },
  {
    "nome": "Milton Donizetti da Silva",
    "email": "milton.donizetti.da.silva@imper.local",
    "telefone": "(35) 99100-9743",
    "cpfCnpj": "46707395653",
    "rg": "MG-19.817.815",
    "cargo": "Impermeabilizador"
  },
  {
    "nome": "Paulo Marcelo Bernardes",
    "email": "paulo.marcelo.bernardes@imper.local",
    "telefone": "(35) 92205-7209",
    "cpfCnpj": "66249171649",
    "rg": "MG-6.162.019",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Priscila Oliveira Cordeiro",
    "email": "priscila.oliveira.cordeiro@imper.local",
    "telefone": "(35) 99155-0669",
    "cpfCnpj": "04664606605",
    "rg": "MG-11.649.600",
    "cargo": "Auxiliar Administrativo"
  },
  {
    "nome": "Vitor da Cruz",
    "email": "vitor.da.cruz@imper.local",
    "telefone": "(35) 99918-9804",
    "cpfCnpj": "31437974600",
    "rg": "M 3.034480",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Denis Wilson Morais",
    "email": "denis.wilson.morais@imper.local",
    "telefone": "(35) 98826-9198",
    "cpfCnpj": "02647921652",
    "rg": "MG-6.851.845",
    "cargo": "Almoxarife"
  },
  {
    "nome": "Genésio Costa Aguiar",
    "email": "genesio.costa.aguiar@imper.local",
    "telefone": "(35) 99733-4142",
    "cpfCnpj": "02002259607",
    "rg": "MG-19.944.591",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Bruno Luís Veronesi",
    "email": "bruno.luis.veronesi@imper.local",
    "telefone": "(35) 99944-6285",
    "cpfCnpj": "09102916673",
    "rg": null,
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Rômulo Ribeiro S. Campos",
    "email": "romulo.ribeiro.s.campos@imper.local",
    "telefone": "(35) 99139-8834",
    "cpfCnpj": "11589762673",
    "rg": "MG-18.029.662",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "José Rodolfo da Silva",
    "email": "jose.rodolfo.da.silva@imper.local",
    "telefone": "(35) 99888-6425",
    "cpfCnpj": "06419942659",
    "rg": "MG 13718934",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Leandro José Dias",
    "email": "leandro.jose.dias@imper.local",
    "telefone": "(35) 99911-0345",
    "cpfCnpj": "05891142635",
    "rg": "MG-13.384.751",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Natan da Silva",
    "email": "natan.da.silva@imper.local",
    "telefone": "(35) 99229-6444",
    "cpfCnpj": "10432593683",
    "rg": "MG-15.784.709",
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Valdemar Guarberto",
    "email": "valdemar.guarberto@imper.local",
    "telefone": "(35) 99902-5506",
    "cpfCnpj": "86835467649",
    "rg": "34.940.797-8",
    "cargo": "Pedreiro"
  },
  {
    "nome": "Waldivino da Silva",
    "email": "waldivino.da.silva@imper.local",
    "telefone": "(35) 99913-3600",
    "cpfCnpj": null,
    "rg": null,
    "cargo": "Serviços Gerais"
  },
  {
    "nome": "Renato Gonçalves Pereira",
    "email": "renato.goncalves.pereira@imper.local",
    "telefone": "(35) 99862-2933",
    "cpfCnpj": "08771070680",
    "rg": "14392926",
    "cargo": "Pintor"
  },
  {
    "nome": "Cristiano José Alves de Araújo",
    "email": "cristiano.jose.alves.de.araujo@imper.local",
    "telefone": null,
    "cpfCnpj": null,
    "rg": null,
    "cargo": "Auxiliar de Impermeabilização"
  },
  {
    "nome": "Cláudio Cassiano da Silva",
    "email": "claudio.cassiano.da.silva@imper.local",
    "telefone": "(35) 99957-2889",
    "cpfCnpj": null,
    "rg": null,
    "cargo": "Auxiliar de Impermeabilização"
  }
];

async function main() {
  console.log('=== Iniciando cadastro de ' + COLABORADORES.length + ' colaboradores na tabela `users` ===\n');

  // Busca papéis para atribuição conforme o cargo
  const [papelColaborador, papelAlmoxarife, papelAtendimento, papelAdministrativo] = await Promise.all([
    prisma.papelRbac.findUnique({ where: { nome: 'COLABORADOR' } }),
    prisma.papelRbac.findUnique({ where: { nome: 'ALMOXARIFE' } }),
    prisma.papelRbac.findUnique({ where: { nome: 'ATENDIMENTO' } }),
    prisma.papelRbac.findUnique({ where: { nome: 'ADMINISTRATIVO' } }),
  ]);
  if (!papelColaborador) {
    throw new Error('Perfil COLABORADOR não encontrado. Execute db:seed-rbac antes deste script.');
  }

  // Prepara cargos utilizados
  const cargoCache = new Map<string, number>();
  for (const c of COLABORADORES) {
    if (!cargoCache.has(c.cargo)) {
      let cargo = await prisma.cargo.findFirst({
        where: { nome: c.cargo },
      });
      if (!cargo) {
        cargo = await prisma.cargo.create({
          data: {
            nome: c.cargo,
            descricao: `Função de ${c.cargo}`,
            ativo: true,
          },
        });
      }
      cargoCache.set(c.cargo, cargo.id);
    }
  }

  let criados = 0;
  let atualizados = 0;

  for (const c of COLABORADORES) {
    const cargoId = cargoCache.get(c.cargo) ?? null;

    // Busca usuário existente por CPF, email ou nome
    let user = null;
    if (c.cpfCnpj) {
      user = await prisma.user.findUnique({ where: { cpfCnpj: c.cpfCnpj } });
    }
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: c.email } });
    }
    if (!user) {
      user = await prisma.user.findFirst({ where: { nome: c.nome } });
    }

    const userData = {
      nome: c.nome,
      email: c.email,
      telefone: c.telefone,
      cpfCnpj: c.cpfCnpj,
      rg: c.rg,
      cargoId,
      senhaHash: SENHA_HASH,
      ativo: true,
    };

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: userData,
      });
      atualizados++;
    } else {
      user = await prisma.user.create({
        data: userData,
      });
      criados++;
    }

    // Define papel correto pelo cargo
    let papelAtribuirId = papelColaborador.id;
    if (c.cargo === 'Almoxarife' && papelAlmoxarife) {
      papelAtribuirId = papelAlmoxarife.id;
    } else if (c.cargo === 'Secretária' && papelAtendimento) {
      papelAtribuirId = papelAtendimento.id;
    } else if (c.cargo === 'Auxiliar Administrativo' && papelAdministrativo) {
      papelAtribuirId = papelAdministrativo.id;
    }

    // Remove papéis antigos deste usuário e vincula o papel correspondente
    await prisma.usuarioPapel.deleteMany({ where: { userId: user.id } });
    await prisma.usuarioPapel.create({
      data: {
        userId: user.id,
        papelId: papelAtribuirId,
      },
    });

    console.log(
      `[OK] ID ${user.id} | ${user.nome} | Cargo: ${c.cargo} | Tel: ${c.telefone ?? '—'} | CPF: ${c.cpfCnpj ?? '—'} | RG: ${c.rg ?? '—'}`
    );
  }

  console.log('\n=== Cadastro de colaboradores concluído com sucesso! ===');
  console.log(`Criados: ${criados}`);
  console.log(`Atualizados: ${atualizados}`);
  console.log(`Total processado: ${COLABORADORES.length}`);
  console.log("Perfil atribuído: 'COLABORADOR'");
  console.log("Senha definida: 'senha123' (hash bcrypt)");
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
