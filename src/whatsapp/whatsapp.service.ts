import { Injectable, Logger } from '@nestjs/common';
import { config } from '../config.js';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  async enviarCodigoRecuperacao(telefone: string, codigo: string): Promise<boolean> {
    const mensagem = `Seu código de recuperação é: *${codigo}*. Válido por ${config.resetTokenExpiresMin} minutos.`;

    if (!config.whatsappApiUrl) {
      this.logger.log(`[WhatsApp DEV] Para: ${telefone} | Código: ${codigo}`);
      return true;
    }

    try {
      const numeroLimpo = telefone.replace(/\D/g, '');
      const response = await fetch(`${config.whatsappApiUrl}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.whatsappApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: numeroLimpo,
          type: 'text',
          text: { body: mensagem },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`WhatsApp API erro ${response.status}: ${body}`);
        return false;
      }

      this.logger.log(`WhatsApp enviado para ${telefone}`);
      return true;
    } catch (err) {
      this.logger.error(`Falha ao enviar WhatsApp para ${telefone}: ${err}`);
      return false;
    }
  }

}
