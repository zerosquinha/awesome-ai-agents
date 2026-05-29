'use strict';

// Bot 1: Aviso automatico de ausencia.
// Responde a quem manda mensagem avisando que voce esta ausente e
// geralmente so acessa o WhatsApp no fim de semana.

const config = require('./../config');
const { isWeekend, Cooldown } = require('./../utils');

const cooldown = new Cooldown(config.awayNotice.cooldownHours);

function buildMessage() {
  return (
    `Ola! Aqui e uma mensagem automatica. 🤖\n\n` +
    `No momento estou *ausente* e geralmente so acesso o WhatsApp no *final de semana*.\n\n` +
    `Assim que possivel, vou ver sua mensagem e te responder. Obrigado pela compreensao! 🙏`
  );
}

/**
 * @param {import('whatsapp-web.js').Message} message
 * @returns {Promise<boolean>} true se enviou o aviso
 */
async function handleAwayNotice(message) {
  if (!config.awayNotice.enabled) return false;

  // Nos fins de semana voce costuma estar online -> opcionalmente nao avisa.
  if (config.awayNotice.skipOnWeekend && isWeekend()) return false;

  const chat = await message.getChat();

  // Em grupos o aviso de ausencia geral nao faz sentido (evita spam).
  if (chat.isGroup) return false;

  // Evita responder repetidamente o mesmo contato.
  if (!cooldown.ready(chat.id._serialized)) return false;

  await chat.sendMessage(buildMessage());
  cooldown.mark(chat.id._serialized);
  console.log(`[ausencia] aviso enviado para ${chat.id._serialized}`);
  return true;
}

module.exports = { handleAwayNotice };
