import { ApiProperty } from '@nestjs/swagger';

export class InstagramWebhookDto {
  @ApiProperty()
  object: string;

  @ApiProperty()
  entry: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: {
        text?: string;
        from?: { username: string };
      };
    }>;
  }>;
}
