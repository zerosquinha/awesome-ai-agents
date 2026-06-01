'use strict';

const http = require('http');
const TelegramBot = require('node-telegram-bot-api');

const config = require('./config');
const { isQuestion, Cooldown } = require('./utils');
const { forwardQuestionByEmail } = require('./email');

if (!config.telegram.token) {
  console.error('Erro: defina TELEGRAM_BOT_TOKEN no arquivo .env (token do @BotFather).');
  process.exit(1);
}

// Pequeno servidor HTTP de "saude". Necessario em hospedagens como o Render
// (que exigem uma porta aberta) e usado por monitores tipo UptimeRobot para
// manter o servico acordado 24/7. Em uso local, simplesmente fica ocioso.
if (config.healthPort) {
  http
    .createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Bot do Telegram ativo.');
    })
    .listen(config.healthPort, () => {
      console.log(`[health] servidor de saude ouvindo na porta ${config.healthPort}`);
    });
}

const bot = new TelegramBot(config.telegram.token, { polling: true });
const cooldown = new Cooldown(config.telegram.cooldownHours);

// Username do proprio bot (preenchido no start), usado para detectar mencoes.
let botUsername = null;

function buildReply() {
  return (
    `Obrigado pela sua mensagem! 🤖\n\n` +
    `Esta e uma resposta automatica: sua pergunta foi registrada e *encaminhada* ` +
    `diretamente para ${config.ownerName}.\n\n` +
    `Assim que ${config.ownerName} tomar ciencia, respondera prontamente. 🙏`
  );
}

// Saudacao mostrada quando a pessoa abre o bot (/start) ou pede ajuda (/help).
function buildWelcome() {
  return (
    `Ola! 👋 Voce chegou ao *canal de recados* de ${config.ownerName}.\n\n` +
    `${config.ownerName} costuma ficar ausente durante a semana e so acessa ` +
    `nos fins de semana.\n\n` +
    `📩 Pode deixar sua *pergunta ou recado* aqui mesmo. Assim que ${config.ownerName} ` +
    `tomar ciencia, respondera prontamente. 🙏`
  );
}

// Decide se a mensagem e uma pergunta direcionada a voce.
function isDirectedQuestion(msg) {
  const text = msg.text || msg.caption || '';
  if (!isQuestion(text)) return false;

  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  if (!isGroup) return true; // conversa privada: tudo e direcionado a voce

  if (!config.telegram.onlyWhenMentionedInGroups) return true;

  // Em grupos: so se o bot foi mencionado (@bot) ou a mensagem responde o bot.
  const repliedToBot =
    msg.reply_to_message &&
    msg.reply_to_message.from &&
    msg.reply_to_message.from.username === botUsername;

  const mentioned =
    botUsername &&
    (msg.entities || []).some((e) => {
      if (e.type !== 'mention') return false;
      const mentionText = text.substring(e.offset, e.offset + e.length);
      return mentionText.toLowerCase() === '@' + botUsername.toLowerCase();
    });

  return Boolean(repliedToBot || mentioned);
}

function senderName(msg) {
  const u = msg.from || {};
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
  const handle = u.username ? `@${u.username}` : `id ${u.id}`;
  return name ? `${name} (${handle})` : handle;
}

function chatName(msg) {
  if (msg.chat.type === 'private') return 'Conversa privada';
  return `Grupo: ${msg.chat.title || msg.chat.id}`;
}

async function handleMessage(msg) {
  const text = msg.text || msg.caption || '';
  if (!text) return;

  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

  // Saudacao de boas-vindas quando a pessoa abre o bot (/start) ou pede ajuda
  // (/help). So faz sentido em conversa privada.
  if (!isGroup && /^\/(start|help)\b/.test(text)) {
    try {
      await bot.sendMessage(msg.chat.id, buildWelcome(), { parse_mode: 'Markdown' });
      console.log(`[start] saudacao enviada para ${senderName(msg)}.`);
    } catch (err) {
      console.error('[start] falha ao enviar saudacao:', err.message);
    }
    return;
  }

  // Ignora os demais comandos (ex.: /algo).
  if (text.startsWith('/')) return;

  if (!isDirectedQuestion(msg)) {
    console.log(`[ignorado] mensagem nao reconhecida como pergunta direcionada: "${text}"`);
    return;
  }
  // O cooldown nao se aplica a grupos quando configurado para encaminhar tudo.
  if (!isGroup && !cooldown.ready(String(msg.chat.id))) {
    console.log('[cooldown] aguardando intervalo antes de encaminhar de novo este chat.');
    return;
  }
  if (!isGroup) cooldown.mark(String(msg.chat.id));

  // 1) Em conversa privada, responde a quem perguntou. Em grupos, fica
  //    silencioso (so encaminha por e-mail) para nao poluir a conversa.
  if (!isGroup) {
    try {
      await bot.sendMessage(msg.chat.id, buildReply(), {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id,
      });
      console.log(`[resposta] respondido a ${senderName(msg)} no Telegram.`);
    } catch (err) {
      console.error('[resposta] falha ao responder no Telegram:', err.message);
    }
  }

  // 2) Encaminha por e-mail de forma independente.
  try {
    await forwardQuestionByEmail({
      from: senderName(msg),
      chat: chatName(msg),
      question: text,
      when: new Date((msg.date || Date.now() / 1000) * 1000),
    });
    console.log(`[encaminhar] pergunta de ${senderName(msg)} enviada para ${config.forward.toEmail}`);
  } catch (err) {
    console.error('[encaminhar] falha ao enviar e-mail:', err.message);
  }
}

bot.on('message', (msg) => {
  // Log de diagnostico: confirma que QUALQUER mensagem esta chegando ao bot.
  const preview = msg.text || msg.caption || '(sem texto)';
  console.log(`[recebido] chat=${msg.chat.id} tipo=${msg.chat.type} de=${(msg.from || {}).username || (msg.from || {}).id}: "${preview}"`);
  handleMessage(msg).catch((err) =>
    console.error('[message] erro ao processar mensagem:', err.message)
  );
});

bot.on('polling_error', (err) => {
  // 409 = outra instancia do bot esta rodando (puxando as mensagens). Avisa claramente.
  if (String(err.message).includes('409')) {
    console.error('[polling] CONFLITO 409: ha outra copia deste bot rodando (outro deploy, ou rodando no seu PC). Pare a outra copia.');
  } else {
    console.error('[polling]', err.message);
  }
});

bot.getMe()
  .then((me) => {
    botUsername = me.username;
    console.log(`[telegram] conectado como @${botUsername} ✅`);
    console.log(`  Encaminhando perguntas para: ${config.forward.toEmail}`);
  })
  .catch((err) => {
    console.error('[telegram] falha ao conectar (token invalido?):', err.message);
    process.exit(1);
  });

process.on('SIGINT', async () => {
  console.log('\nEncerrando...');
  try { await bot.stopPolling(); } catch (_) {}
  process.exit(0);
});
