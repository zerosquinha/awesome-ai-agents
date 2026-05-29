# WhatsApp — Bot de Aviso de Ausência

Bot de WhatsApp que responde automaticamente avisando que você está **ausente** e geralmente só acessa o WhatsApp no **final de semana**.

Construído com [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

> 💡 O bot de **encaminhamento de perguntas por e-mail** é um projeto separado, feito para o **Telegram**, na pasta [`../telegram-pergunta-bot`](../telegram-pergunta-bot).

## Como funciona

Usa o **WhatsApp Web** (não-oficial). Você conecta escaneando um QR code uma única vez; a sessão fica salva em `.wwebjs_auth/`. A partir daí, quando alguém te manda mensagem numa conversa privada, o bot responde com o aviso de ausência (respeitando um cooldown para não responder repetidamente o mesmo contato).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior.
- Um número de WhatsApp (de preferência um dedicado/secundário).

## Instalação

```bash
cd whatsapp-ausencia-bot
npm install
cp .env.example .env
# (opcional) ajuste as configuracoes no .env
```

## Configuração (`.env`)

| Variável | Descrição |
|---|---|
| `OWNER_NAME` | Seu nome, usado nas mensagens automáticas. |
| `ENABLE_AWAY_NOTICE` | Liga/desliga o aviso de ausência. |
| `SKIP_AWAY_ON_WEEKEND` | Não envia o aviso nos fins de semana (você costuma estar online). |
| `AWAY_COOLDOWN_HOURS` | Horas mínimas antes de reenviar o aviso ao mesmo contato. |

## Uso

```bash
npm start
```

Na primeira execução, escaneie o QR code que aparece no terminal:
**WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho.**

Depois disso a sessão fica salva e não precisa escanear de novo.

## Estrutura

```
whatsapp-ausencia-bot/
  src/
    index.js                 # conecta ao WhatsApp e processa as mensagens
    config.js                # lê as variáveis do .env
    utils.js                 # fim de semana e cooldown
    handlers/
      awayNotice.js          # aviso de ausência
```

## Avisos importantes

- O `whatsapp-web.js` é uma biblioteca **não-oficial**. Use com bom senso (cooldowns já evitam spam) para reduzir risco de bloqueio. Para uso profissional/em escala, considere a [WhatsApp Cloud API oficial](https://developers.facebook.com/docs/whatsapp/cloud-api).
- Nunca comite seu arquivo `.env` (já está no `.gitignore`).
