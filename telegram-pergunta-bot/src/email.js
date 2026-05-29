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

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });

  return transporter;
}

/**
 * Encaminha uma pergunta recebida no Telegram para o e-mail configurado.
 * @param {object} info
 * @param {string} info.from     Nome/usuario de quem enviou
 * @param {string} info.chat     Nome do chat/grupo de origem
 * @param {string} info.question Texto da pergunta
 * @param {Date}   info.when     Data/hora da mensagem
 */
async function forwardQuestionByEmail({ from, chat, question, when }) {
  const t = getTransporter();
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

  await t.sendMail({
    from: config.smtp.from,
    to: config.forward.toEmail,
    subject,
    text,
    html,
  });
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { forwardQuestionByEmail, getTransporter };
