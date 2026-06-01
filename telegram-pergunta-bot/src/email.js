'use strict';

const nodemailer = require('nodemailer');
const config = require('./config');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.smtp.user || !config.smtp.pass) {
    throw new Error(
      'SMTP nao configurado: defina SMTP_USER e SMTP_PASS no arquivo .env'
    );
  }

  // A senha de app do Gmail e mostrada com espacos (ex.: "abcd efgh ...").
  // Removemos os espacos automaticamente para evitar erro de autenticacao.
  const pass = String(config.smtp.pass).replace(/\s+/g, '');

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure, // true para porta 465; false para 587 (STARTTLS)
    auth: { user: config.smtp.user, pass },
    // Timeouts para nao travar caso a porta esteja bloqueada na hospedagem.
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
}

function buildContent({ from, chat, question, when }) {
  const stamp = (when || new Date()).toLocaleString('pt-BR');
  const subject = `[Telegram] Pergunta de ${from}`;
  const text =
    `Voce recebeu uma pergunta no Telegram enquanto estava ausente.\n\n` +
    `De: ${from}\n` +
    `Chat: ${chat}\n` +
    `Quando: ${stamp}\n\n` +
    `Pergunta:\n${question}\n`;
  const html =
    `<p>Voce recebeu uma pergunta no Telegram enquanto estava ausente.</p>` +
    `<ul>` +
    `<li><strong>De:</strong> ${escapeHtml(from)}</li>` +
    `<li><strong>Chat:</strong> ${escapeHtml(chat)}</li>` +
    `<li><strong>Quando:</strong> ${escapeHtml(stamp)}</li>` +
    `</ul>` +
    `<p><strong>Pergunta:</strong></p>` +
    `<blockquote>${escapeHtml(question).replace(/\n/g, '<br>')}</blockquote>`;
  return { subject, text, html };
}

// Envio via API HTTP do Resend (porta 443). Funciona em hospedagens que
// bloqueiam SMTP (como o plano gratuito do Render).
async function sendViaResend({ subject, text, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resend.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.resend.from,
      to: [config.forward.toEmail],
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend respondeu ${res.status}: ${detail}`);
  }
}

// Envio via SMTP (nodemailer). Usado quando nao ha Resend configurado.
async function sendViaSmtp({ subject, text, html }) {
  const t = getTransporter();
  await t.sendMail({
    from: config.smtp.from,
    to: config.forward.toEmail,
    subject,
    text,
    html,
  });
}

/**
 * Encaminha uma pergunta recebida no Telegram para o e-mail configurado.
 * Usa Resend (API HTTP) se RESEND_API_KEY estiver definido; senao, SMTP.
 * @param {object} info
 * @param {string} info.from     Nome/usuario de quem enviou
 * @param {string} info.chat     Nome do chat/grupo de origem
 * @param {string} info.question Texto da pergunta
 * @param {Date}   info.when     Data/hora da mensagem
 */
async function forwardQuestionByEmail(info) {
  const content = buildContent(info);
  if (config.resend.apiKey) {
    await sendViaResend(content);
  } else {
    await sendViaSmtp(content);
  }
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { forwardQuestionByEmail, getTransporter };
