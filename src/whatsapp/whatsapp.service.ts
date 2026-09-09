import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsAppService {
  async enviarMensagem(telefone: string, mensagem: string) {
    console.log(`[WhatsApp Stub] Enviando para ${telefone}: ${mensagem}`);
    return { success: true, mock: true };
  }

  async enviarChecklist(
    telefone: string,
    atividadeId: string,
    itens: string[],
  ) {
    console.log(
      `[WhatsApp Stub] Checklist para ${telefone} - Atividade ${atividadeId}`,
    );
    console.log(`  Itens: ${itens.join(', ')}`);
    return { success: true, mock: true };
  }

  async processarResposta(telefone: string, mensagem: string) {
    console.log(`[WhatsApp Stub] Resposta de ${telefone}: ${mensagem}`);
    return { reconhecido: false, mock: true };
  }
}
