import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config.js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null = null;

  constructor() {
    if (config.smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });
      this.logger.log(`Email transporter configurado: ${config.smtpHost}:${config.smtpPort}`);
    } else {
      this.logger.warn('SMTP não configurado — emails serão logados no console (DEV)');
    }
  }

  async enviarLinkRecuperacao(
    email: string,
    token: string,
    nome: string,
  ): Promise<boolean> {
    const link = `${config.publicBaseUrl}/redefinir-senha?token=${token}`;

    if (!this.transporter) {
      this.logger.log(`[Email DEV] Para: ${email} | Link: ${link}`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: config.emailFrom,
        to: email,
        subject: 'Redefinição de senha — Imper',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">Redefinição de senha</h2>
  <p>Olá <strong>${nome}</strong>,</p>
  <p> Você solicitou a redefinição da sua senha.</p>
  <p>Clique no botão abaixo para criar uma nova senha:</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="${link}"
       style="background-color: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
      Redefinir senha
    </a>
  </p>
  <p style="color: #666; font-size: 13px;">Se o botão não funcionar, copie e cole este link no navegador:</p>
  <p style="color: #666; font-size: 13px; word-break: break-all;">${link}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 12px;">Este link é válido por ${config.resetTokenExpiresMin} minutos.</p>
</body>
</html>`,
      });
      this.logger.log(`Email de recuperação enviado para ${email}`);
      return true;
    } catch (err) {
      this.logger.error(`Falha ao enviar email para ${email}: ${err}`);
      return false;
    }
  }
}
