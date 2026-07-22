import { ApiProperty } from '@nestjs/swagger';

export class WhatsAppWebhookDto {
  @ApiProperty()
  instance: string;

  @ApiProperty()
  data: {
    key: { remoteJid: string };
    pushName: string;
    message: { conversation: string };
  };
}
