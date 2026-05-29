'use strict';

// Bot 2: Encaminhamento de perguntas.
// Quando a mensagem e uma pergunta direcionada a voce, responde que voce
// respondera assim que tomar ciencia e encaminha a pergunta para o e-mail.

const config = require('./../config');
const { isQuestion, Cooldown } = require('./../utils');
const { forwardQuestionByEmail } = require('./../email');

const cooldown = new Cooldown(config.forward.cooldownHours);

function buildReply() {
  return (
    `Obrigado pela sua mensagem! 🤖\n\n` +
    `Esta e uma resposta automatica: sua pergunta foi registrada e *encaminhada* ` +
    `diretamente para ${config.ownerName}.\n\n` +
    `Assim que ${config.ownerName} tomar ciencia, respondera prontamente. 🙏`
  );
}

/**
 * Verifica se a mensagem deve ser tratada como pergunta direcionada.
 * @param {import('whatsapp-web.js').Message} message
 * @param {import('whatsapp-web.js').Chat} chat
 */
async function isDirectedQuestion(message, chat) {
  const text = message.body || '';
  if (!isQuestion(text)) return false;

  if (chat.isGroup && config.forward.onlyWhenMentionedInGroups) {
    // Em grupos, so trata se o proprio numero (bot) foi mencionado.
    const mentions = await message.getMentions();
    const me = message.client.info && message.client.info.wid
      ? message.client.info.wid._serialized
      : null;
    return mentions.some((c) => c.id._serialized === me);
  }

  return true;
}

/**
 * @param {import('whatsapp-web.js').Message} message
 * @returns {Promise<boolean>} true se encaminhou a pergunta
 */
async function handleForwardQuestion(message) {
  if (!config.forward.enabled) return false;

  const chat = await message.getChat();
  if (!(await isDirectedQuestion(message, chat))) return false;

  if (!cooldown.ready(chat.id._serialized)) return false;

  const contact = await message.getContact();
  const fromName =
    contact.pushname || contact.name || contact.number || 'Desconhecido';

  try {
    await forwardQuestionByEmail({
      from: `${fromName} (${contact.number || 's/numero'})`,
      chat: chat.isGroup ? `Grupo: ${chat.name}` : 'Conversa privada',
      question: message.body || '',
      when: new Date((message.timestamp || Date.now() / 1000) * 1000),
    });

    await chat.sendMessage(buildReply());
    cooldown.mark(chat.id._serialized);
    console.log(`[encaminhar] pergunta de ${fromName} enviada para ${config.forward.toEmail}`);
    return true;
  } catch (err) {
    console.error('[encaminhar] falha ao enviar e-mail:', err.message);
    return false;
  }
}

module.exports = { handleForwardQuestion };
