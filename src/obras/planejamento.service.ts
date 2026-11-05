import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';
import { WhatsAppService } from '../whatsapp/whatsapp.service.js';
import type {
  ConcluirTarefaColaboradorInput,
  SalvarPlanejamentoInput,
} from './dto/planejamento.dto.js';

@Injectable()
export class PlanejamentoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async obterPlanejamento(obraId: number) {
    const obra = await this.prisma.obra.findUnique({
      where: { id: obraId },
      include: {
        endereco: true,
        user: { select: { id: true, nome: true, email: true, telefone: true } },
        orcamento: { select: { id: true, codigo: true, validade: true } },
        etapas: {
          where: { inativo: false },
          orderBy: { ordem: 'asc' },
          include: {
            atividades: {
              where: { cancelada: false },
              orderBy: { ordem: 'asc' },
              include: {
                verbo: { select: { id: true, nome: true } },
                objeto: { select: { id: true, nome: true } },
                local: { select: { id: true, nome: true } },
                caracteristica: { select: { id: true, nome: true } },
                materiais: {
                  include: {
                    material: {
                      select: {
                        id: true,
                        nome: true,
                        unidade: { select: { nome: true } },
                      },
                    },
                  },
                },
                execucoes: {
                  where: { status: { not: 'CANCELADA' } },
                  include: {
                    atribuidoA: {
                      select: {
                        id: true,
                        nome: true,
                        cargo: { select: { nome: true } },
                        telefone: true,
                      },
                    },
                    veiculo: {
                      select: {
                        id: true,
                        nome: true,
                        placa: true,
                        modelo: true,
                      },
                    },
                    separacoes: {
                      include: {
                        itens: {
                          include: {
                            material: {
                              select: {
                                id: true,
                                nome: true,
                                unidade: { select: { nome: true } },
                              },
                            },
                            epi: {
                              select: { id: true, nome: true, numeroCa: true },
                            },
                            equipamento: {
                              select: {
                                id: true,
                                descricao: true,
                                codigo: true,
                                modelo: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!obra) {
      throw new NotFoundException(`Obra ${obraId} não encontrada`);
    }

    // Listas auxiliares para seleção
    const [colaboradores, veiculos, epis, equipamentos, materiais] =
      await Promise.all([
        this.prisma.user.findMany({
          where: {
            ativo: true,
            papeis: {
              some: {
                papel: {
                  nome: {
                    in: ['COLABORADOR', 'Colaborador', 'Colaboradores', 'COLABORADORES'],
                  },
                },
              },
            },
          },
          select: {
            id: true,
            nome: true,
            telefone: true,
            cargo: { select: { id: true, nome: true } },
            papeis: {
              select: {
                papel: {
                  select: { id: true, nome: true },
                },
              },
            },
          },
          orderBy: { nome: 'asc' },
        }),
        this.prisma.veiculo.findMany({
          where: { ativo: true },
          select: {
            id: true,
            nome: true,
            placa: true,
            modelo: true,
          },
          orderBy: { nome: 'asc' },
        }),
        this.prisma.epi.findMany({
          where: { ativo: true },
          select: {
            id: true,
            nome: true,
            codigo: true,
            numeroCa: true,
          },
          orderBy: { nome: 'asc' },
        }),
        this.prisma.equipamento.findMany({
          where: { ativo: true },
          select: {
            id: true,
            descricao: true,
            codigo: true,
            modelo: true,
          },
          orderBy: { descricao: 'asc' },
        }),
        this.prisma.material.findMany({
          where: { status: 'ATIVO' },
          select: {
            id: true,
            nome: true,
            unidade: { select: { nome: true } },
          },
          orderBy: { nome: 'asc' },
        }),
      ]);

    return {
      obra: {
        id: obra.id,
        codigo: obra.codigo,
        status: obra.status,
        dataInicioPrevista: obra.dataInicioPrevista,
        dataDisparoWhatsapp: obra.dataDisparoWhatsapp,
        statusWhatsapp: obra.statusWhatsapp,
        cliente: obra.user?.nome ?? 'Cliente',
        enderecoCompleto: obra.endereco
          ? `${obra.endereco.logradouro}, ${obra.endereco.numero ?? 'S/N'} - ${obra.endereco.bairro ?? ''}, ${obra.endereco.cidade ?? ''} - ${obra.endereco.estado ?? ''}`
          : 'Endereço não cadastrado',
        etapas: obra.etapas,
      },
      catalogos: {
        colaboradores,
        veiculos,
        epis,
        equipamentos,
        materiais,
      },
    };
  }

  async salvarPlanejamento(
    obraId: number,
    dto: SalvarPlanejamentoInput,
    userId: number,
  ) {
    const obra = await this.prisma.obra.findUnique({
      where: { id: obraId },
      include: {
        endereco: true,
        user: { select: { nome: true } },
      },
    });

    if (!obra) {
      throw new NotFoundException(`Obra ${obraId} não encontrada`);
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Atualizar dados gerais da obra
      await tx.obra.update({
        where: { id: obraId },
        data: {
          dataInicioPrevista: dto.dataInicioPrevista
            ? new Date(dto.dataInicioPrevista)
            : null,
          statusWhatsapp: dto.dispararAgora ? 'ENVIADO' : (obra.statusWhatsapp ?? 'PENDENTE'),
        },
      });

      // 2. Processar cada atividade informada
      for (const ativInput of dto.atividades) {
        if (ativInput.dataDisparoWhatsapp !== undefined) {
          const novaData = ativInput.dataDisparoWhatsapp
            ? new Date(ativInput.dataDisparoWhatsapp)
            : null;
          const atual = await tx.obraAtividade.findUnique({
            where: { id: ativInput.atividadeId },
            select: { dataDisparoWhatsapp: true },
          });
          const mudou =
            (atual?.dataDisparoWhatsapp?.getTime() ?? null) !== (novaData?.getTime() ?? null);
          await tx.obraAtividade.update({
            where: { id: ativInput.atividadeId },
            data: {
              dataDisparoWhatsapp: novaData,
              // Reagendar invalida o envio anterior da atividade
              ...(mudou ? { statusWhatsapp: 'PENDENTE' } : {}),
            },
          });
        }

        // Normaliza a lista de colaboradores selecionados (múltiplos ou único)
        const targetColabIds: number[] = Array.from(
          new Set(
            (ativInput.colaboradoresIds && ativInput.colaboradoresIds.length > 0)
              ? ativInput.colaboradoresIds
              : ativInput.colaboradorId
                ? [ativInput.colaboradorId]
                : [],
          ),
        );

        // Busca todas as execuções ativas para esta atividade
        const existentes = await tx.execucaoAtividade.findMany({
          where: {
            atividadeId: ativInput.atividadeId,
            status: { not: 'CANCELADA' },
          },
        });

        const dataPrevisaoDate = ativInput.dataPrevisao
          ? new Date(ativInput.dataPrevisao)
          : null;

        let primaryExecucaoId: string | null = null;

        if (targetColabIds.length === 0) {
          // Nenhum colaborador selecionado
          if (existentes.length > 0) {
            const primeira = existentes[0];
            primaryExecucaoId = primeira.id;
            await tx.execucaoAtividade.update({
              where: { id: primeira.id },
              data: {
                atribuidoAId: null,
                veiculoId: ativInput.veiculoId ?? null,
                dataPrevisao: dataPrevisaoDate,
              },
            });

            // Cancela as excedentes
            for (let i = 1; i < existentes.length; i++) {
              await tx.execucaoAtividade.update({
                where: { id: existentes[i].id },
                data: { status: 'CANCELADA' },
              });
            }
          } else {
            const nova = await tx.execucaoAtividade.create({
              data: {
                atividadeId: ativInput.atividadeId,
                atribuidoAId: null,
                veiculoId: ativInput.veiculoId ?? null,
                dataPrevisao: dataPrevisaoDate,
                criadoPorId: userId,
                status: 'PENDENTE',
                tokenAcesso: crypto.randomBytes(24).toString('hex'),
              },
            });
            primaryExecucaoId = nova.id;
          }
        } else {
          // Um ou mais colaboradores selecionados
          const idsExistentesNaoUsados = [...existentes];

          for (let i = 0; i < targetColabIds.length; i++) {
            const colabId = targetColabIds[i];

            const idxMatch = idsExistentesNaoUsados.findIndex(
              (e) => e.atribuidoAId === colabId,
            );

            let execId: string;
            if (idxMatch >= 0) {
              const execItem = idsExistentesNaoUsados.splice(idxMatch, 1)[0];
              execId = execItem.id;
              await tx.execucaoAtividade.update({
                where: { id: execItem.id },
                data: {
                  veiculoId: ativInput.veiculoId ?? null,
                  dataPrevisao: dataPrevisaoDate,
                },
              });
            } else if (idsExistentesNaoUsados.length > 0) {
              const execItem = idsExistentesNaoUsados.shift()!;
              execId = execItem.id;
              await tx.execucaoAtividade.update({
                where: { id: execItem.id },
                data: {
                  atribuidoAId: colabId,
                  veiculoId: ativInput.veiculoId ?? null,
                  dataPrevisao: dataPrevisaoDate,
                },
              });
            } else {
              const nova = await tx.execucaoAtividade.create({
                data: {
                  atividadeId: ativInput.atividadeId,
                  atribuidoAId: colabId,
                  veiculoId: ativInput.veiculoId ?? null,
                  dataPrevisao: dataPrevisaoDate,
                  criadoPorId: userId,
                  status: 'PENDENTE',
                  tokenAcesso: crypto.randomBytes(24).toString('hex'),
                },
              });
              execId = nova.id;
            }

            if (i === 0) {
              primaryExecucaoId = execId;
            }
          }

          // Cancela quaisquer execuções restantes não aproveitadas
          for (const sobrou of idsExistentesNaoUsados) {
            await tx.execucaoAtividade.update({
              where: { id: sobrou.id },
              data: { status: 'CANCELADA' },
            });
          }
        }

        // 3. Atualizar ou criar Separação de Insumos da Execução Primária
        if (primaryExecucaoId) {
          let separacao = await tx.separacao.findFirst({
            where: {
              executucaoAtividade: { atividadeId: ativInput.atividadeId },
            },
          });

          if (separacao && separacao.executucaoAtividadeId !== primaryExecucaoId) {
            separacao = await tx.separacao.update({
              where: { id: separacao.id },
              data: { executucaoAtividadeId: primaryExecucaoId },
            });
          } else if (!separacao) {
            const total = await tx.separacao.count();
            separacao = await tx.separacao.create({
              data: {
                codigo: `SEP-${String(total + 1).padStart(6, '0')}`,
                executucaoAtividadeId: primaryExecucaoId,
                dataNecessidade: dataPrevisaoDate ?? new Date(),
                status: 'PENDENTE',
                statusNovo: 'SEPARACAO_PENDENTE',
                criadoPorId: userId,
              },
            });
          }

          // Remove itens existentes da separação para regravar conforme configurado no planejamento
          await tx.separacaoItem.deleteMany({
            where: { separacaoId: separacao.id },
          });

          const itensParaCriar: Prisma.SeparacaoItemCreateManyInput[] = [];

          // Materiais
          for (const mat of ativInput.materiais ?? []) {
            if (mat.quantidade > 0) {
              itensParaCriar.push({
                separacaoId: separacao.id,
                materialId: mat.materialId,
                quantidadeNecessaria: new Prisma.Decimal(mat.quantidade),
              });
            }
          }

          // EPIs
          for (const epi of ativInput.epis ?? []) {
            if (epi.quantidade > 0) {
              itensParaCriar.push({
                separacaoId: separacao.id,
                epiId: epi.epiId,
                quantidadeNecessaria: new Prisma.Decimal(epi.quantidade),
              });
            }
          }

          // Ferramentas / Equipamentos
          for (const eq of ativInput.equipamentos ?? []) {
            itensParaCriar.push({
              separacaoId: separacao.id,
              equipamentoId: eq.equipamentoId,
              quantidadeNecessaria: new Prisma.Decimal(1),
            });
          }

          if (itensParaCriar.length > 0) {
            await tx.separacaoItem.createMany({
              data: itensParaCriar,
            });
          }
        }
      }
    });

    if (dto.dispararAgora) {
      await this.dispararWhatsapp(obraId);
    }

    return this.obterPlanejamento(obraId);
  }

  async dispararWhatsapp(obraId: number) {
    const dados = await this.obterPlanejamento(obraId);
    const obra = dados.obra;

    // Agrupa tarefas por colaborador
    const tarefasPorColab = new Map<
      number,
      {
        colaborador: { id: number; nome: string; telefone: string | null };
        veiculo?: { nome: string; placa: string };
        tokenAcesso?: string;
        tarefas: Array<{
          atividadeId: string;
          descricao: string;
          etapa: string;
          dataPrevisao?: string | null;
          materiais: string[];
          epis: string[];
          equipamentos: string[];
        }>;
      }
    >();

    for (const etapa of obra.etapas) {
      for (const ativ of etapa.atividades) {
        // Encontra itens de separação da atividade (seja da execução primária ou qualquer outra)
        const separacaoItens =
          ativ.execucoes?.find((e: any) => e.separacoes?.length)?.separacoes[0]?.itens ?? [];
        const materiais = separacaoItens
          .filter((i: any) => i.material)
          .map((i: any) => `${i.material!.nome} (${Number(i.quantidadeNecessaria)} ${i.material!.unidade?.nome ?? 'un'})`);
        const epis = separacaoItens
          .filter((i: any) => i.epi)
          .map((i: any) => `${i.epi!.nome} (Qtd: ${Number(i.quantidadeNecessaria)})`);
        const equipamentos = separacaoItens
          .filter((i: any) => i.equipamento)
          .map((i: any) => `${i.equipamento!.descricao} [${i.equipamento!.codigo}]`);

        for (const exec of ativ.execucoes ?? []) {
          if (!exec || !exec.atribuidoA) continue;

          const colabId = exec.atribuidoA.id;
          let registro = tarefasPorColab.get(colabId);
          if (!registro) {
            registro = {
              colaborador: {
                id: colabId,
                nome: exec.atribuidoA.nome,
                telefone: exec.atribuidoA.telefone,
              },
              veiculo: exec.veiculo
                ? { nome: exec.veiculo.nome, placa: exec.veiculo.placa }
                : undefined,
              tokenAcesso: exec.tokenAcesso ?? undefined,
              tarefas: [],
            };
            tarefasPorColab.set(colabId, registro);
          }

          registro.tarefas.push({
            atividadeId: ativ.id,
            descricao: ativ.descricao,
            etapa: etapa.nome,
            dataPrevisao: exec.dataPrevisao
              ? new Date(exec.dataPrevisao).toLocaleDateString('pt-BR')
              : null,
            materiais,
            epis,
            equipamentos,
          });
        }
      }
    }

    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    let enviosSucesso = 0;
    const atividadesEnviadas = new Set<string>();

    for (const [, item] of tarefasPorColab) {
      if (!item.colaborador.telefone) continue;

      const tarefasTexto = item.tarefas
        .map(
          (t, idx) =>
            `*${idx + 1}. ${t.etapa} - ${t.descricao}*` +
            (t.dataPrevisao ? `\n   📅 Data prevista: ${t.dataPrevisao}` : '') +
            (t.materiais.length ? `\n   📦 Materiais: ${t.materiais.join(', ')}` : '') +
            (t.epis.length ? `\n   🦺 EPIs: ${t.epis.join(', ')}` : '') +
            (t.equipamentos.length ? `\n   🛠️ Equipamentos: ${t.equipamentos.join(', ')}` : ''),
        )
        .join('\n\n');

      const veiculoTexto = item.veiculo
        ? `🚗 *Veículo designado:* ${item.veiculo.nome} (${item.veiculo.placa})\n`
        : '';

      const linkPortal = `${appUrl}/colaborador/tarefas?token=${item.tokenAcesso}`;

      const mensagem =
        `Olá, *${item.colaborador.nome}*!\n\n` +
        `Você foi escalado para a obra *${obra.codigo}*.\n` +
        `📍 *Local:* ${obra.enderecoCompleto}\n` +
        veiculoTexto +
        `\n📋 *Suas Atividades Programadas:*\n\n${tarefasTexto}\n\n` +
        `✅ *Acesse o link abaixo para marcar as atividades concluídas:*\n` +
        `${linkPortal}`;

      const enviado = await this.whatsappService.enviarMensagem(
        item.colaborador.telefone,
        mensagem,
      );
      if (enviado) {
        enviosSucesso++;
        for (const t of item.tarefas) atividadesEnviadas.add(t.atividadeId);
      }
    }

    if (atividadesEnviadas.size > 0) {
      await this.prisma.obraAtividade.updateMany({
        where: { id: { in: [...atividadesEnviadas] } },
        data: { statusWhatsapp: 'ENVIADO' },
      });
    }

    await this.prisma.obra.update({
      where: { id: obraId },
      data: { statusWhatsapp: 'ENVIADO' },
    });

    return {
      totalColaboradores: tarefasPorColab.size,
      enviosSucesso,
    };
  }

  async obterTarefasColaboradorPorToken(token: string) {
    if (!token) {
      throw new BadRequestException('Token de acesso não informado');
    }

    const execucao = await this.prisma.execucaoAtividade.findUnique({
      where: { tokenAcesso: token },
      include: {
        atribuidoA: {
          select: { id: true, nome: true, cargo: { select: { nome: true } } },
        },
        atividade: {
          include: {
            obraEtapa: {
              include: {
                obra: {
                  include: {
                    endereco: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!execucao) {
      throw new NotFoundException('Link de tarefas inválido ou expirado');
    }

    const obraId = execucao.atividade.obraEtapa.obra.id;
    const colaboradorId = execucao.atribuidoAId;

    // Busca todas as tarefas atribuídas a este colaborador nesta mesma obra
    const todasExecucoes = await this.prisma.execucaoAtividade.findMany({
      where: {
        atribuidoAId: colaboradorId,
        atividade: {
          obraEtapa: { obraId },
        },
        status: { not: 'CANCELADA' },
      },
      include: {
        veiculo: {
          select: { id: true, nome: true, placa: true, modelo: true },
        },
        atividade: {
          include: {
            obraEtapa: true,
            execucoes: {
              include: {
                separacoes: {
                  include: {
                    itens: {
                      include: {
                        material: {
                          select: {
                            id: true,
                            nome: true,
                            unidade: { select: { nome: true } },
                          },
                        },
                        epi: { select: { id: true, nome: true, numeroCa: true } },
                        equipamento: {
                          select: { id: true, descricao: true, codigo: true, modelo: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        separacoes: {
          include: {
            itens: {
              include: {
                material: {
                  select: {
                    id: true,
                    nome: true,
                    unidade: { select: { nome: true } },
                  },
                },
                epi: { select: { id: true, nome: true, numeroCa: true } },
                equipamento: {
                  select: { id: true, descricao: true, codigo: true, modelo: true },
                },
              },
            },
          },
        },
      },
      orderBy: { dataPrevisao: 'asc' },
    });

    const obra = execucao.atividade.obraEtapa.obra;
    const endereco = obra.endereco
      ? `${obra.endereco.logradouro}, ${obra.endereco.numero ?? 'S/N'} - ${obra.endereco.bairro ?? ''}, ${obra.endereco.cidade ?? ''} - ${obra.endereco.estado ?? ''}`
      : 'Endereço não cadastrado';

    return {
      colaborador: execucao.atribuidoA,
      obra: {
        id: obra.id,
        codigo: obra.codigo,
        endereco,
      },
      veiculo: todasExecucoes[0]?.veiculo,
      tarefas: todasExecucoes.map((ex) => {
        const itens =
          ex.separacoes?.[0]?.itens ??
          (ex.atividade as any)?.execucoes?.find((e: any) => e.separacoes?.length)?.separacoes[0]?.itens ??
          [];
        return {
          id: ex.id,
          descricao: ex.atividade.descricao,
          etapa: ex.atividade.obraEtapa.nome,
          dataPrevisao: ex.dataPrevisao,
          status: ex.status,
          concluido: ex.status === 'CONCLUIDA',
          dataConclusao: ex.dataConclusao,
          fotoConclusaoUrl: ex.fotoConclusaoUrl,
          observacaoConclusao: ex.observacaoConclusao,
          materiais: itens
            .filter((i) => i.material)
            .map((i) => `${i.material!.nome} (${Number(i.quantidadeNecessaria)} ${i.material!.unidade?.nome ?? 'un'})`),
          epis: itens
            .filter((i) => i.epi)
            .map((i) => `${i.epi!.nome} (Qtd: ${Number(i.quantidadeNecessaria)})`),
          equipamentos: itens
            .filter((i) => i.equipamento)
            .map((i) => `${i.equipamento!.descricao} [${i.equipamento!.codigo}]`),
        };
      }),
    };
  }

  async concluirTarefa(
    execucaoId: string,
    dto: ConcluirTarefaColaboradorInput,
  ) {
    const exec = await this.prisma.execucaoAtividade.findUnique({
      where: { id: execucaoId },
    });

    if (!exec) {
      throw new NotFoundException('Atividade não encontrada');
    }

    if (exec.tokenAcesso !== dto.token) {
      throw new BadRequestException('Token inválido para esta atividade');
    }

    let fotoUrl = exec.fotoConclusaoUrl;

    if (dto.fotoWebpBase64) {
      try {
        const base64Data = dto.fotoWebpBase64.replace(
          /^data:image\/\w+;base64,/,
          '',
        );
        const buffer = Buffer.from(base64Data, 'base64');
        const uploadDir = path.join(process.cwd(), 'uploads', 'conclusoes');
        await fs.mkdir(uploadDir, { recursive: true });

        const fileName = `${execucaoId}_${Date.now()}.webp`;
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);

        fotoUrl = `/uploads/conclusoes/${fileName}`;
      } catch (err) {
        // Falha no salvamento da imagem não impede a conclusão da tarefa
      }
    }

    const statusNovo = dto.concluido ? 'CONCLUIDA' : 'PENDENTE';

    // Atualiza a execução do colaborador solicitante
    const atualizada = await this.prisma.execucaoAtividade.update({
      where: { id: execucaoId },
      data: {
        status: statusNovo,
        dataConclusao: dto.concluido ? new Date() : null,
        fotoConclusaoUrl: fotoUrl,
        observacaoConclusao: dto.observacao ?? exec.observacaoConclusao,
      },
    });

    // Sincroniza também as demais execuções ativas da mesma atividade nesta obra
    await this.prisma.execucaoAtividade.updateMany({
      where: {
        atividadeId: exec.atividadeId,
        id: { not: execucaoId },
        status: { not: 'CANCELADA' },
      },
      data: {
        status: statusNovo,
        dataConclusao: dto.concluido ? new Date() : null,
        fotoConclusaoUrl: fotoUrl,
        observacaoConclusao: dto.observacao ?? exec.observacaoConclusao,
      },
    });

    return atualizada;
  }
}
