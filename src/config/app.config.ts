import { ConfigService } from '@nestjs/config';

export const getAppConfig = (configService: ConfigService) => ({
  port: configService.get<number>('PORT', 3000),
  corsOrigins: configService.get<string>(
    'CORS_ORIGINS',
    'http://localhost:5173',
  ),
});
