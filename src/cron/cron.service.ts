import { Injectable } from '@nestjs/common';

@Injectable()
export class CronService {
  async verificarPrazos() {
    console.log('[Cron Stub] Verificando prazos de atividades...');
    return { mock: true };
  }

  async notificarAtrasos() {
    console.log('[Cron Stub] Notificando atrasos...');
    return { mock: true };
  }
}
