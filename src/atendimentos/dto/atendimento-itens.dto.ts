export interface CriarAtendimentoItemDto {
  etapaId: number;
  subServicoId: number;
  verboId: number;
  objetoId: number;
  localId?: number | null;
  caracteristicaId?: number | null;
  observacoes?: string | null;
}
