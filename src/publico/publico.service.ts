import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface SolicitarOrcamentoDto {
  nome: string;
  telefone: string;
  email?: string;
  mensagem?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  numero?: string;
  complemento?: string;
}

@Injectable()
export class PublicoService {
  constructor(private readonly prisma: PrismaService) {}

  async listarServicos() {
    const servicos = await this.prisma.servicoMarketing.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    });
    if (servicos.length > 0) return servicos;

    return [
      {
        id: 1,
        titulo: 'Impermeabilização de Piscinas',
        descricao:
          'Sistemas flexíveis e argamassas poliméricas para piscinas enterradas ou elevadas.',
        icone: 'waves',
        ativo: true,
        ordem: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        titulo: 'Impermeabilização de Lajes',
        descricao:
          'Proteção contra infiltrações com mantas asfálticas e membranas líquidas.',
        icone: 'home',
        ativo: true,
        ordem: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        titulo: 'Injeção de Poliuretano & Resinas',
        descricao:
          'Tratamento de trincas, fissuras e vazamentos com injeção de alta pressão.',
        icone: 'shield',
        ativo: true,
        ordem: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        titulo: 'Impermeabilização de Reservatórios',
        descricao:
          "Soluções atóxicas e certificadas para água potável e caixas d'água.",
        icone: 'droplet',
        ativo: true,
        ordem: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async listarCidades() {
    const cidades = await this.prisma.cidadeAtendida.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    });
    if (cidades.length > 0) return cidades;

    return [
      {
        id: 1,
        nome: 'Poços de Caldas',
        uf: 'MG',
        lat: -21.7878,
        lng: -46.5614,
      },
      { id: 2, nome: 'Andradas', uf: 'MG', lat: -22.0683, lng: -46.5694 },
      { id: 3, nome: 'Caldas', uf: 'MG', lat: -21.9231, lng: -46.3908 },
      {
        id: 4,
        nome: 'Bandeira do Sul',
        uf: 'MG',
        lat: -21.7828,
        lng: -46.3886,
      },
      { id: 5, nome: 'Botelhos', uf: 'MG', lat: -21.6428, lng: -46.3953 },
      {
        id: 6,
        nome: 'Santa Rita do Caldas',
        uf: 'MG',
        lat: -22.0292,
        lng: -46.3353,
      },
    ];
  }

  async solicitarOrcamento(dto: SolicitarOrcamentoDto) {
    let cliente = await this.prisma.cliente.findFirst({
      where: {
        OR: [
          { telefone: dto.telefone },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });

    if (!cliente) {
      cliente = await this.prisma.cliente.create({
        data: {
          nome: dto.nome,
          telefone: dto.telefone,
          email: dto.email ?? null,
        },
      });
    }

    if (dto.endereco) {
      await this.prisma.endereco.create({
        data: {
          clienteId: cliente.id,
          logradouro: dto.endereco,
          numero: dto.numero ?? null,
          complemento: dto.complemento ?? null,
          bairro: dto.bairro ?? null,
          cidade: dto.cidade ?? 'Poços de Caldas',
          estado: dto.estado ?? 'MG',
          cep: dto.cep ?? null,
          principal: true,
        },
      });
    }

    const atendimento = await this.prisma.atendimento.create({
      data: {
        canal: 'FORMULARIO',
        status: 'NOVO',
        descricao:
          dto.mensagem ?? 'Solicitação de orçamento via formulário web',
        clienteId: cliente.id,
      },
    });

    return {
      id: atendimento.id,
      nome: cliente.nome,
      canal: atendimento.canal,
      status: atendimento.status,
      createdAt: atendimento.createdAt.toISOString(),
    };
  }
}
