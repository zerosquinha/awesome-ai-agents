'use strict';

require('dotenv').config();

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'sim', 'on'].includes(String(value).trim().toLowerCase());
}

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const config = {
  ownerName: process.env.OWNER_NAME || 'eu',

  // Porta do servidor de saude (HTTP). Hospedagens como o Render definem PORT
  // automaticamente. Em uso local fica desligado, a menos que voce defina PORT.
  healthPort: num(process.env.PORT, 0),

  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    onlyWhenMentionedInGroups: bool(process.env.ONLY_WHEN_MENTIONED_IN_GROUPS, true),
    cooldownHours: num(process.env.FORWARD_COOLDOWN_HOURS, 1),
  },

  forward: {
    toEmail: process.env.FORWARD_TO_EMAIL || 'ze.rosquinha3@gmail.com',
  },

  // Resend: envio de e-mail via API HTTP (funciona onde SMTP e bloqueado).
  // Se RESEND_API_KEY estiver definido, ele e usado no lugar do SMTP.
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    // Remetente. Sem dominio proprio, use o de testes do Resend:
    from: process.env.RESEND_FROM || 'onboarding@resend.dev',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: num(process.env.SMTP_PORT, 465),
    secure: bool(process.env.SMTP_SECURE, true),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || process.env.SMTP_USER || '',
  },
};

module.exports = config;
