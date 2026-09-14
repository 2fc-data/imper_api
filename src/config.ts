import path from 'node:path';

const isProd = process.env.NODE_ENV === 'production';

interface AppConfig {
  port: number;
  jwtSecret: string;
  jwtExpires: string;
  uploadsDir: string;
  publicBaseUrl: string;
  turnstileSecret: string;
  resetTokenExpiresMin: number;
  isDev: boolean;
  corsOrigins: string[];
  whatsappApiUrl: string;
  whatsappApiToken: string;
  whatsappFromNumber: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  emailFrom: string;
}

export const config: AppConfig = {
  port: Number(process.env.PORT || 3000),
  jwtSecret:
    process.env.JWT_SECRET ||
    (isProd
      ? (() => {
          throw new Error('JWT_SECRET must be set in production');
        })()
      : 'imper-dev-secret'),
  jwtExpires: process.env.JWT_EXPIRES || '12h',
  uploadsDir: process.env.UPLOADS_DIR || path.resolve(import.meta.dirname, '../uploads'),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
  turnstileSecret: process.env.TURNSTILE_SECRET || '',
  resetTokenExpiresMin: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 10),
  isDev: !isProd,
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  whatsappApiUrl: process.env.WHATSAPP_API_URL || '',
  whatsappApiToken: process.env.WHATSAPP_API_TOKEN || '',
  whatsappFromNumber: process.env.WHATSAPP_FROM_NUMBER || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@imper.com',
};
