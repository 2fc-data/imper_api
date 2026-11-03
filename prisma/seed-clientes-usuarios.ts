/**
 * Seed de Usuários (Clientes / Obras)
 * Cadastra a lista de 93 clientes/obras na tabela `users`,
 * com a senha padrão 'senha123', perfil 'CLIENTE' e respectivos endereços.
 *
 * Idempotente: pode ser executado múltiplas vezes com segurança.
 *
 * Execução: npx tsx prisma/seed-clientes-usuarios.ts
 */
import { PrismaClient, EnderecoRotulo } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SENHA_HASH = bcrypt.hashSync('senha123', 10);

interface ClienteUsuarioSeed {
  nome: string;
  email: string;
  rotulo: EnderecoRotulo;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

const CLIENTES: ClienteUsuarioSeed[] = [
  {
    "nome": "Ed. Ana Rosa (C & B Construtora - P. Caldas/MG)",
    "email": "ed.ana.rosa.c.b.construtora.p.caldas.mg@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Obra - Rua São João da Boa Vista (P. Caldas/MG)",
    "email": "obra.rua.sao.joao.da.boa.vista.p.caldas.mg@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua São João da Boa Vista",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sra. Lídia",
    "email": "sra.lidia@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": "Residência",
    "bairro": "São Domingos",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Luan Caixeta",
    "email": "luan.caixeta@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "ATAI",
    "email": "atai@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Campos do Jordão",
    "estado": "SP",
    "cep": "12460-000"
  },
  {
    "nome": "Sr. Caio Melo (residência)",
    "email": "sr.caio.melo.residencia@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Av. Júlia Hussen Rayday",
    "numero": "21",
    "complemento": null,
    "bairro": "Centreville",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Rodrigo Donato",
    "email": "sr.rodrigo.donato@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": "Residência",
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sra. Luciana ETHOS",
    "email": "sra.luciana.ethos@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Dr Tobias",
    "email": "dr.tobias@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "C. Cachoeira",
    "estado": "MG",
    "cep": "37225-000"
  },
  {
    "nome": "Topázio",
    "email": "topazio@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Águas da Prata",
    "estado": "SP",
    "cep": "13890-000"
  },
  {
    "nome": "Fazenda B Vista",
    "email": "fazenda.b.vista@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Escola E.Sto Pinhal",
    "email": "escola.e.sto.pinhal@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Espírito Santo do Pinhal",
    "estado": "SP",
    "cep": "13990-000"
  },
  {
    "nome": "Up Life Style",
    "email": "up.life.style@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Rio Grande do Norte",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "San Michel Supermercado",
    "email": "san.michel.supermercado@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Macro",
    "email": "macro@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Prédio Assis Figueiredo",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "JF Construtora",
    "email": "jf.construtora@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Jd. Europa",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Paulo",
    "email": "sr.paulo@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Casa",
    "numero": "43",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Campos do Jordão",
    "estado": "SP",
    "cep": "12460-000"
  },
  {
    "nome": "Sr. Rodrigo Donato (2)",
    "email": "sr.rodrigo.donato.2@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": "Residência",
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Supermercado",
    "email": "supermercado@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Itobi",
    "estado": "SP",
    "cep": "13715-000"
  },
  {
    "nome": "Condomínio Vilage",
    "email": "condominio.vilage@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Gama Cruz",
    "email": "gama.cruz@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Gama Cruz",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Vila Cruz",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Marlon",
    "email": "sr.marlon@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": "Residência",
    "bairro": "Urbana",
    "cidade": "São José do Rio Pardo",
    "estado": "SP",
    "cep": "13720-000"
  },
  {
    "nome": "Sr. Ezequiel",
    "email": "sr.ezequiel@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Bem-ti-vi",
    "numero": "225",
    "complemento": null,
    "bairro": "Morada dos Pássaros",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sra. Aliene",
    "email": "sra.aliene@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Residencial Alamedas",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Eng. Pedro",
    "email": "eng.pedro@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Fazenda Lamess",
    "email": "fazenda.lamess@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Rural",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Waldo",
    "email": "sr.waldo@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Pernambuco",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Atlanta Office",
    "email": "atlanta.office@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Europa Mall",
    "email": "europa.mall@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Av. Lisboa",
    "numero": "379",
    "complemento": null,
    "bairro": "Jd. Europa",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sanvel",
    "email": "sanvel@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Paraíba",
    "numero": "812",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Hugo",
    "email": "sr.hugo@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Mohalenm",
    "email": "mohalenm@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Bloco",
    "numero": "3",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Guilherme Mercadante",
    "email": "sr.guilherme.mercadante@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Caio Melo (residência - Urbana)",
    "email": "sr.caio.melo.residencia.2@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Fazenda B. Vista",
    "email": "fazenda.b.vista.1@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Rural",
    "cidade": "São João da Boa Vista",
    "estado": "SP",
    "cep": "13870-000"
  },
  {
    "nome": "Condomínio Veneza",
    "email": "condominio.veneza@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Residencial Veneza",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Parque das Águas",
    "email": "parque.das.aguas@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Parque das Águas",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "São Lourenço",
    "estado": "MG",
    "cep": "37470-000"
  },
  {
    "nome": "Posto Estádio",
    "email": "posto.estadio@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Av. Sílvio Monteiro dos Santos",
    "numero": "200",
    "complemento": null,
    "bairro": "Ponte Preta",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Ford",
    "email": "ford@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Dr. Júlio",
    "email": "dr.julio@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sra. Adriana",
    "email": "sra.adriana@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "São José do Rio Pardo",
    "estado": "SP",
    "cep": "13720-000"
  },
  {
    "nome": "Sr. Humberto",
    "email": "sr.humberto@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Caconde",
    "estado": "SP",
    "cep": "13770-000"
  },
  {
    "nome": "Sr. Maicon",
    "email": "sr.maicon@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "São José do Rio Pardo",
    "estado": "SP",
    "cep": "13720-000"
  },
  {
    "nome": "Sr. Murilo",
    "email": "sr.murilo@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "São João da Boa Vista",
    "estado": "SP",
    "cep": "13870-000"
  },
  {
    "nome": "Macro (Av. Assis Figueiredo)",
    "email": "macro.2@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Av. Assis Figueiredo",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "Mg",
    "cep": "37701-000"
  },
  {
    "nome": "Ed Euclides da Cunha",
    "email": "ed.euclides.da.cunha@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "João Batista",
    "email": "joao.batista@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "C. Cachoeira",
    "estado": "MG",
    "cep": "37225-000"
  },
  {
    "nome": "Cratos",
    "email": "cratos@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Mutum",
    "numero": "180",
    "complemento": null,
    "bairro": "Jóias do Vale do Sol",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Alfredo",
    "email": "sr.alfredo@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Caconde",
    "estado": "SP",
    "cep": "13770-000"
  },
  {
    "nome": "Sr. Humberto (Santa Rita de Caldas)",
    "email": "sr.humberto.2@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Santa Rita de Caldas",
    "estado": "MG",
    "cep": "37775-000"
  },
  {
    "nome": "Sr. Giovani",
    "email": "sr.giovani@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Campo do Golfe",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Isabela Monteiro",
    "email": "isabela.monteiro@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Av:João Pinheiro",
    "numero": "6885",
    "complemento": null,
    "bairro": "Bortlan",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Simaroni",
    "email": "sr.simaroni@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Murilo (2)",
    "email": "sr.murilo.2@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "São João da Boa Vista",
    "estado": "SP",
    "cep": "13870-000"
  },
  {
    "nome": "Sr. Murilo (3)",
    "email": "sr.murilo.3@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "São João da Boa Vista",
    "estado": "SP",
    "cep": "13870-000"
  },
  {
    "nome": "Monreale Resort Parque Aquático",
    "email": "monreale.resort.parque.aquatico@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Av. Leonor. F Delgado",
    "numero": "3033",
    "complemento": null,
    "bairro": "Jd. Philadelphia",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "COC",
    "email": "coc@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Ceará",
    "numero": "321",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Vale das Antas",
    "email": "vale.das.antas@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Solar das Laranjeiras",
    "email": "solar.das.laranjeiras@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": "Prédio residencial",
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Parque das Águas (2)",
    "email": "parque.das.aguas.2@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Parque das Águas",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "São Lourenço",
    "estado": "MG",
    "cep": "37470-000"
  },
  {
    "nome": "Vila Fiori",
    "email": "vila.fiori@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Up Life Style (2)",
    "email": "up.life.style.2@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Rio Grande do Norte",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Golfe - Júlia",
    "email": "golfe.julia@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Paulo Topázio",
    "email": "sr.paulo.topazio@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Águas da Prata",
    "estado": "SP",
    "cep": "13890-000"
  },
  {
    "nome": "Sra. Natália",
    "email": "sra.natalia@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Atlanta Office (2)",
    "email": "atlanta.office.2@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Guga C Dias",
    "email": "sr.guga.c.dias@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Dr Adelson",
    "email": "dr.adelson@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "C. Cachoeira",
    "estado": "MG",
    "cep": "37225-000"
  },
  {
    "nome": "Argentina Mall",
    "email": "argentina.mall@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Argentina",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Jd. Quisisana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Residencial Pamplona",
    "email": "residencial.pamplona@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Argentina",
    "numero": "200",
    "complemento": "Apto 31 (Face Norte/Oeste)",
    "bairro": "Jd. Quisisana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Fernando & Raíssa",
    "email": "fernando.raissa@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "C. Cachoeira",
    "estado": "MG",
    "cep": "37225-000"
  },
  {
    "nome": "Sra. Mariana",
    "email": "sra.mariana@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sra. Aliene (2)",
    "email": "sra.aliene.2@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Residencial Alamedas",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sra. Karina",
    "email": "sra.karina@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Willian Almeida - Morro Azul",
    "email": "willian.almeida.morro.azul@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Pizzo Europa",
    "email": "pizzo.europa@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Jd. Europa",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Rafael",
    "email": "sr.rafael@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Residencial Vila Toscana",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Jd. Europa",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Walter",
    "email": "sr.walter@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Av. Padre Cretus Francis Cox",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Jd. Country Club",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Millenium",
    "email": "millenium@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Caxambu",
    "estado": "MG",
    "cep": "37440-000"
  },
  {
    "nome": "Residencial Pamplona (2)",
    "email": "residencial.pamplona.2@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Argentina",
    "numero": "200",
    "complemento": "Apto 31 (Face Norte/Oeste)",
    "bairro": "Jd. Quisisana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Vila Togni",
    "email": "vila.togni@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Urbana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sr. Teixeira",
    "email": "sr.teixeira@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Campo do Golfe",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Dra. Tânia",
    "email": "dra.tania@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Paraíba",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Dra. Tânia (Caldense)",
    "email": "dra.tania.2@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Caldense",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Sra. Sueli",
    "email": "sra.sueli@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Buenos Aires",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Jd. Quisisana",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Claudia Amaral",
    "email": "claudia.amaral@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "San Michel Supermercados",
    "email": "san.michel.supermercados@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Corrêa Neto",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "S J Rio Preto",
    "email": "s.j.rio.preto@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "São José do Rio Preto",
    "estado": "SP",
    "cep": "15010-000"
  },
  {
    "nome": "Alexandre V Boas",
    "email": "alexandre.v.boas@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Rafael Simone - C. Golf",
    "email": "rafael.simone.c.golf@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Hotel Nacional - B. Cobra",
    "email": "hotel.nacional.b.cobra@imper.local",
    "rotulo": "OBRA",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Cecília - Azaléia",
    "email": "cecilia.azaleia@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  },
  {
    "nome": "Éder Recapoços",
    "email": "eder.recapocos@imper.local",
    "rotulo": "RESIDENCIAL",
    "logradouro": "Rua Principal",
    "numero": "S/N",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Poços de Caldas",
    "estado": "MG",
    "cep": "37701-000"
  }
];

async function main() {
  console.log('=== Iniciando cadastro de ' + CLIENTES.length + ' usuários na tabela `users` ===\n');

  // Busca papel CLIENTE
  const papelCliente = await prisma.papelRbac.findUnique({
    where: { nome: 'CLIENTE' },
  });
  if (!papelCliente) {
    throw new Error('Papel CLIENTE não encontrado. Execute o seed-rbac antes deste script.');
  }

  let criados = 0;
  let atualizados = 0;

  for (const c of CLIENTES) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: c.email },
          { nome: c.nome },
        ],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          nome: c.nome,
          email: c.email,
          senhaHash: SENHA_HASH,
          ativo: true,
        },
      });
      atualizados++;
    } else {
      user = await prisma.user.create({
        data: {
          nome: c.nome,
          email: c.email,
          senhaHash: SENHA_HASH,
          ativo: true,
        },
      });
      criados++;
    }

    // Vincula papel CLIENTE
    await prisma.usuarioPapel.upsert({
      where: {
        userId_papelId: {
          userId: user.id,
          papelId: papelCliente.id,
        },
      },
      create: {
        userId: user.id,
        papelId: papelCliente.id,
      },
      update: {},
    });

    // Cria ou atualiza endereço principal
    const enderecoExistente = await prisma.endereco.findFirst({
      where: { userId: user.id },
    });

    if (enderecoExistente) {
      await prisma.endereco.update({
        where: { id: enderecoExistente.id },
        data: {
          rotulo: c.rotulo,
          logradouro: c.logradouro,
          numero: c.numero,
          complemento: c.complemento,
          bairro: c.bairro,
          cidade: c.cidade,
          estado: c.estado,
          cep: c.cep,
          principal: true,
        },
      });
    } else {
      await prisma.endereco.create({
        data: {
          userId: user.id,
          rotulo: c.rotulo,
          logradouro: c.logradouro,
          numero: c.numero,
          complemento: c.complemento,
          bairro: c.bairro,
          cidade: c.cidade,
          estado: c.estado,
          cep: c.cep,
          principal: true,
        },
      });
    }

    console.log(`[OK] ID ${user.id} | ${user.nome} (${user.email}) -> ${c.logradouro}, ${c.bairro}, ${c.cidade}/${c.estado}`);
  }

  console.log('\n=== Cadastro concluído com sucesso! ===');
  console.log(`Criados: ${criados}`);
  console.log(`Atualizados: ${atualizados}`);
  console.log(`Total processado: ${CLIENTES.length}`);
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
