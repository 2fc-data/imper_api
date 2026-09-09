import { config } from '../config.js';
import { AppError } from './errors.js';

export async function verificarTurnstile(
  token: string,
  ip?: string,
): Promise<void> {
  if (!config.turnstileSecret) {
    if (config.isDev) return;
    throw new AppError(503, 'Verificação anti-robô não configurada');
  }
  if (!token) throw new AppError(400, 'Token de verificação não informado');

  const body = new URLSearchParams({
    secret: config.turnstileSecret,
    response: token,
  });
  if (ip) body.set('remoteip', ip);

  let result: { success?: boolean; 'error-codes'?: string[] };
  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body },
    );
    result = (await res.json()) as typeof result;
  } catch {
    throw new AppError(503, 'Falha ao verificar o desafio anti-robô');
  }

  if (!result.success) {
    throw new AppError(400, 'Falha na verificação anti-robô');
  }
}
