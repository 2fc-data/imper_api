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
  resetTokenExpiresMin: Number(process.env.RESET_TOKEN_EXPIRES_MIN || 60),
  isDev: !isProd,
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
