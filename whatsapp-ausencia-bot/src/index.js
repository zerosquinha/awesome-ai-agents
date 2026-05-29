'use strict';

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const config = require('./config');
const { handleAwayNotice } = require('./handlers/awayNotice');

const client = new Client({
  authStrategy: new LocalAuth(), // salva a sessao em .wwebjs_auth (escaneia QR so 1x)
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr) => {
  console.log('\nEscaneie o QR code abaixo no WhatsApp (Aparelhos conectados):\n');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => console.log('[whatsapp] autenticado.'));
client.on('auth_failure', (m) => console.error('[whatsapp] falha de autenticacao:', m));
client.on('disconnected', (r) => console.warn('[whatsapp] desconectado:', r));

client.on('ready', () => {
  console.log('[whatsapp] conectado e pronto! ✅');
  console.log(`  Aviso de ausencia: ${config.awayNotice.enabled ? 'ON' : 'OFF'}`);
});

client.on('message', async (message) => {
  try {
    // Ignora mensagens de status/broadcast e mensagens enviadas por voce mesmo.
    if (message.isStatus || message.fromMe) return;
    if (message.from === 'status@broadcast') return;

    // Envia o aviso automatico de ausencia.
    await handleAwayNotice(message);
  } catch (err) {
    console.error('[message] erro ao processar mensagem:', err.message);
  }
});

client.initialize();

process.on('SIGINT', async () => {
  console.log('\nEncerrando...');
  try { await client.destroy(); } catch (_) {}
  process.exit(0);
});
