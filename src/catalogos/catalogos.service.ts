import { Injectable } from '@nestjs/common';
import type { TipoInsumo } from '@prisma/client';
import {
  type LookupCrud,
  LookupService,
} from '../common/services/lookup.service.js';
import { AppError } from '../lib/errors.js';
import { normalize } from '../lib/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const TIPOS_INSUMO = [
  'EQUIPAMENTO',
  'EPI',
  'MATERIAL',
  'DESPESAS_EXTRAS',
  'VEICULO',
  'SERVICO',
] as const;

export type RecursoCatalogos =
  | 'categorias'
  | 'subcategorias'
  | 'marcas'
  | 'fornecedores'
  | 'localizacoes'
  | 'unidades-medida'
  | 'cores'
  | 'tamanhos'
  | 'status-equipamento'
  | 'estados-conservacao'
  | 'tipos-manutencao'
  | 'tipos-despesas';

type DefinicaoRecurso = {
  label: string;
  duplicateMessage: string;
  campos: readonly string[];
  fixo?: TipoInsumo;
  orderBy?: string;
};

const ALIASES: Record<string, RecursoCatalogos> = {
  status: 'status-equipamento',
  statuses: 'status-equipamento',
  'status-equipamentos': 'status-equipamento',
  'tipos-despesa': 'tipos-despesas',
  'unidades-medida': 'unidades-medida',
};

const DEFS: Record<RecursoCatalogos, DefinicaoRecurso> = {
  categorias: {
    label: 'Categoria',
    duplicateMessage: 'Categoria já cadastrada',
    campos: ['nome', 'descricao', 'ordem'],
  },
  subcategorias: {
    label: 'Subcategoria',
    duplicateMessage: 'Subcategoria já cadastrada',
    campos: ['categoriaId', 'nome', 'descricao', 'ordem'],
  },
  marcas: {
    label: 'Marca',
    duplicateMessage: 'Marca já cadastrada',
    campos: ['nome', 'ordem'],
  },
  fornecedores: {
    label: 'Fornecedor',
    duplicateMessage: 'Fornecedor já cadastrado',
    campos: ['nome', 'cnpj', 'telefone', 'email'],
  },
  localizacoes: {
    label: 'Localização',
    duplicateMessage: 'Localização já cadastrada',
    campos: ['nome', 'descricao', 'ordem'],
  },
  'unidades-medida': {
    label: 'Unidade de medida',
    duplicateMessage: 'Unidade de medida já cadastrada',
    campos: ['nome', 'ordem'],
    orderBy: 'ordem',
  },
  cores: {
    label: 'Cor',
    duplicateMessage: 'Cor já cadastrada',
    campos: ['nome', 'codigoHex', 'ordem'],
  },
  tamanhos: {
    label: 'Tamanho',
    duplicateMessage: 'Tamanho já cadastrado',
    campos: ['nome', 'ordem'],
    fixo: 'EPI',
  },
  'status-equipamento': {
    label: 'Status',
    duplicateMessage: 'Status já cadastrado',
    campos: ['nome', 'ordem'],
    fixo: 'EQUIPAMENTO',
  },
  'estados-conservacao': {
    label: 'Estado de conservação',
    duplicateMessage: 'Estado de conservação já cadastrado',
    campos: ['nome', 'ordem'],
    fixo: 'EQUIPAMENTO',
  },
  'tipos-manutencao': {
    label: 'Tipo de manutenção',
    duplicateMessage: 'Tipo de manutenção já cadastrado',
    campos: ['nome', 'ordem'],
    fixo: 'EQUIPAMENTO',
  },
  'tipos-despesas': {
    label: 'Tipo de despesa',
    duplicateMessage: 'Tipo de despesa já cadastrado',
    campos: ['nome', 'descricao', 'requerObra', 'ordem'],
    fixo: 'DESPESAS_EXTRAS',
  },
};

@Injectable()
export class CatalogosService {
  private readonly cruds = new Map<string, LookupCrud>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly lookup: LookupService,
  ) {}

  resolverRecurso(valor: string): RecursoCatalogos {
    const chave = valor.trim().toLowerCase();
    const recurso = (ALIASES[chave] ?? chave) as RecursoCatalogos;
    if (!(recurso in DEFS)) {
      throw new AppError(404, `Recurso de catálogo '${valor}' não encontrado`);
    }
    return recurso;
  }

  parseTipo(valor?: string): TipoInsumo | undefined {
    if (!valor) return undefined;
    if (!(TIPOS_INSUMO as readonly string[]).includes(valor)) {
      throw new AppError(400, 'Tipo de insumo inválido');
    }
    return valor as TipoInsumo;
  }

  async listarTudo(tipo?: TipoInsumo) {
    const dinamico = tipo ? { tipoInsumo: tipo } : {};
    const compativel = (fixo?: TipoInsumo) => !fixo || !tipo || fixo === tipo;

    const [
      categorias,
      subcategorias,
      marcas,
      fornecedores,
      localizacoes,
      unidadesMedida,
      cores,
      tamanhos,
      statusEquipamento,
      estadosConservacao,
      tiposManutencao,
      tiposDespesas,
    ] = await Promise.all([
      this.prisma.categoria.findMany({
        where: { ativo: true, ...dinamico },
        orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      }),
      this.prisma.subcategoria.findMany({
        where: { ativo: true, ...dinamico },
        include: { categoria: true },
        orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      }),
      this.prisma.marca.findMany({
        where: { ativo: true, ...dinamico },
        orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      }),
      this.prisma.fornecedor.findMany({
        where: { ativo: true, ...dinamico },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.localizacao.findMany({
        where: { ativo: true, ...dinamico },
        orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      }),
      this.prisma.unidadeMedida.findMany({
        where: { ativo: true, ...dinamico },
        orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      }),
      this.prisma.cor.findMany({
        where: { ativo: true, ...dinamico },
        orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      }),
      compativel('EPI')
        ? this.prisma.tamanhoEquipamento.findMany({
            where: { ativo: true, tipoInsumo: 'EPI' },
            orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
          })
        : [],
      compativel('EQUIPAMENTO')
        ? this.prisma.statusEquipamento.findMany({
            where: { ativo: true, tipoInsumo: 'EQUIPAMENTO' },
            orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
          })
        : [],
      compativel('EQUIPAMENTO')
        ? this.prisma.estadoConservacao.findMany({
            where: { ativo: true, tipoInsumo: 'EQUIPAMENTO' },
            orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
          })
        : [],
      compativel('EQUIPAMENTO')
        ? this.prisma.tipoManutencao.findMany({
            where: { ativo: true, tipoInsumo: 'EQUIPAMENTO' },
            orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
          })
        : [],
      compativel('DESPESAS_EXTRAS')
        ? this.prisma.tipoDespesa.findMany({
            where: { ativo: true, tipoInsumo: 'DESPESAS_EXTRAS' },
            orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
          })
        : [],
    ]);

    return {
      categorias,
      subcategorias,
      marcas,
      fornecedores,
      localizacoes,
      unidadesMedida,
      cores,
      tamanhos,
      statusEquipamento,
      estadosConservacao,
      tiposManutencao,
      tiposDespesas,
    };
  }

  async listar(recurso: RecursoCatalogos, tipo?: TipoInsumo) {
    recurso = this.resolverRecurso(recurso);
    const def = this.definicao(recurso);
    this.validarTipo(recurso, tipo);

    if (recurso === 'subcategorias') {
      return this.prisma.subcategoria.findMany({
        where: {
          ativo: true,
          ...(tipo ? { tipoInsumo: tipo } : {}),
        },
        include: { categoria: true },
        orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      });
    }

    return this.crud(recurso, def.fixo ?? tipo).listar();
  }

  async criar(
    recurso: RecursoCatalogos,
    data: Record<string, unknown>,
    tipo?: TipoInsumo,
  ) {
    recurso = this.resolverRecurso(recurso);
    const def = this.definicao(recurso);
    const tipoEfetivo = def.fixo ?? tipo;
    this.validarTipo(recurso, tipo);

    if (!tipoEfetivo) {
      throw new AppError(400, 'Informe o tipo de insumo');
    }

    if (recurso === 'subcategorias') {
      return this.criarSubcategoria(data, tipoEfetivo);
    }

    const dados = this.sanitizar(def, data);
    const nome = typeof dados.nome === 'string' ? dados.nome : '';
    if (!nome.trim()) throw new AppError(400, 'Informe o nome');

    return this.crud(recurso, tipoEfetivo).criar({ ...dados, nome });
  }

  async atualizar(
    recurso: RecursoCatalogos,
    id: number,
    data: Record<string, unknown>,
    tipo?: TipoInsumo,
  ) {
    recurso = this.resolverRecurso(recurso);
    const def = this.definicao(recurso);
    this.validarTipo(recurso, tipo);

    if (recurso === 'subcategorias') {
      return this.atualizarSubcategoria(id, data, def.fixo ?? tipo);
    }

    const dados = this.sanitizar(def, data);
    if (dados.nome !== undefined && !String(dados.nome).trim()) {
      throw new AppError(400, 'Informe o nome');
    }

    return this.crud(recurso, def.fixo ?? tipo).atualizar(id, dados);
  }

  async desativar(recurso: RecursoCatalogos, id: number) {
    recurso = this.resolverRecurso(recurso);
    if (recurso === 'subcategorias') {
      return this.prisma.subcategoria.update({
        where: { id },
        data: { ativo: false },
      });
    }
    return this.crud(recurso).desativar(id);
  }

  private definicao(recurso: RecursoCatalogos) {
    const def = DEFS[recurso];
    if (!def) {
      throw new AppError(
        404,
        `Recurso de catálogo '${recurso}' não encontrado`,
      );
    }
    return def;
  }

  private validarTipo(recurso: RecursoCatalogos, tipo?: TipoInsumo) {
    const def = this.definicao(recurso);
    if (def.fixo && tipo && tipo !== def.fixo) {
      throw new AppError(400, `${def.label} só existe para ${def.fixo}`);
    }
  }

  private sanitizar(def: DefinicaoRecurso, data: Record<string, unknown>) {
    const dados: Record<string, unknown> = {};
    for (const campo of def.campos) {
      if (data[campo] === undefined) continue;
      const valor = data[campo];
      if (campo === 'nome' || campo === 'categoriaId') {
        dados[campo] = valor;
      } else if (campo === 'ordem') {
        dados[campo] = Number(valor) || 0;
      } else if (campo === 'requerObra') {
        dados[campo] = !!valor;
      } else {
        const texto = typeof valor === 'string' ? valor.trim() : '';
        dados[campo] = texto || null;
      }
    }
    return dados;
  }

  private async criarSubcategoria(
    data: Record<string, unknown>,
    tipo?: TipoInsumo,
  ) {
    const nome = this.nomeObrigatorio(data.nome);
    const categoria = await this.categoriaValida(data.categoriaId, tipo);
    await this.garantirSubcategoriaUnica(categoria.id, nome);

    return this.prisma.subcategoria.create({
      data: {
        categoriaId: categoria.id,
        tipoInsumo: categoria.tipoInsumo,
        nome,
        descricao: this.textoOpcional(data.descricao),
        ordem: Number(data.ordem) || 0,
      },
    });
  }

  private async atualizarSubcategoria(
    id: number,
    data: Record<string, unknown>,
    tipo?: TipoInsumo,
  ) {
    const atual = await this.prisma.subcategoria.findUnique({
      where: { id },
      select: { id: true, categoriaId: true, nome: true },
    });
    if (!atual) throw new AppError(404, 'Subcategoria não encontrada');

    const categoria =
      data.categoriaId === undefined
        ? await this.categoriaValida(atual.categoriaId, tipo)
        : await this.categoriaValida(data.categoriaId, tipo);

    const nome =
      data.nome === undefined ? atual.nome : this.nomeObrigatorio(data.nome);

    await this.garantirSubcategoriaUnica(categoria.id, nome, id);

    return this.prisma.subcategoria.update({
      where: { id },
      data: {
        categoriaId: categoria.id,
        tipoInsumo: categoria.tipoInsumo,
        ...(data.nome !== undefined && { nome }),
        ...(data.descricao !== undefined && {
          descricao: this.textoOpcional(data.descricao),
        }),
        ...(data.ordem !== undefined && { ordem: Number(data.ordem) || 0 }),
      },
    });
  }

  private nomeObrigatorio(valor: unknown) {
    const nome = typeof valor === 'string' ? valor.trim().toUpperCase() : '';
    if (!nome) throw new AppError(400, 'Informe o nome');
    return nome;
  }

  private textoOpcional(valor: unknown) {
    if (typeof valor !== 'string') return null;
    return valor.trim() || null;
  }

  private async categoriaValida(valor: unknown, tipo?: TipoInsumo) {
    const categoriaId = Number(valor);
    if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
      throw new AppError(400, 'Informe a categoria');
    }
    const categoria = await this.prisma.categoria.findFirst({
      where: { id: categoriaId, ativo: true },
    });
    if (!categoria) throw new AppError(422, 'Categoria inválida');
    if (tipo && categoria.tipoInsumo !== tipo) {
      throw new AppError(400, 'Categoria incompatível com o tipo de insumo');
    }
    return categoria;
  }

  private async garantirSubcategoriaUnica(
    categoriaId: number,
    nome: string,
    ignorarId?: number,
  ) {
    const exists = await this.prisma.subcategoria.findFirst({
      where: {
        categoriaId,
        nome: normalize(nome),
        ...(ignorarId !== undefined && { NOT: { id: ignorarId } }),
      },
    });
    if (exists) throw new AppError(409, 'Subcategoria já cadastrada');
  }

  private crud(recurso: RecursoCatalogos, tipo?: TipoInsumo): LookupCrud {
    const chave = `${recurso}:${tipo ?? 'TODOS'}`;
    const cache = this.cruds.get(chave);
    if (cache) return cache;

    const def = this.definicao(recurso);
    const crud = this.lookup.criarCrud(
      this.delegate(recurso as Exclude<RecursoCatalogos, 'subcategorias'>),
      {
        labelSingular: def.label,
        duplicateMessage: () => def.duplicateMessage,
        ...(def.orderBy && { orderBy: def.orderBy }),
        ...(tipo && { tipoInsumo: tipo }),
      },
    );
    this.cruds.set(chave, crud);
    return crud;
  }

  private delegate(recurso: Exclude<RecursoCatalogos, 'subcategorias'>) {
    switch (recurso) {
      case 'categorias':
        return this.prisma.categoria;
      case 'marcas':
        return this.prisma.marca;
      case 'fornecedores':
        return this.prisma.fornecedor;
      case 'localizacoes':
        return this.prisma.localizacao;
      case 'unidades-medida':
        return this.prisma.unidadeMedida;
      case 'cores':
        return this.prisma.cor;
      case 'tamanhos':
        return this.prisma.tamanhoEquipamento;
      case 'status-equipamento':
        return this.prisma.statusEquipamento;
      case 'estados-conservacao':
        return this.prisma.estadoConservacao;
      case 'tipos-manutencao':
        return this.prisma.tipoManutencao;
      case 'tipos-despesas':
        return this.prisma.tipoDespesa;
    }
  }
}
