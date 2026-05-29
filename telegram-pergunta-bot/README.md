# Telegram — Bot de Encaminhamento de Perguntas

Bot de Telegram que, quando alguém faz uma **pergunta direcionada a você**, responde que você responderá prontamente assim que tomar ciência e **encaminha a pergunta por e-mail** (padrão: `ze.rosquinha3@gmail.com`).

Usa a [API oficial de bots do Telegram](https://core.telegram.org/bots/api) (gratuita) via [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api). O e-mail é enviado por **SMTP do Gmail** com [nodemailer](https://nodemailer.com/).

> 💡 O bot de **aviso de ausência do WhatsApp** é um projeto separado, na pasta [`../whatsapp-ausencia-bot`](../whatsapp-ausencia-bot).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior.
- Um **token de bot** do Telegram, criado com o [@BotFather](https://t.me/BotFather).
- Uma **Senha de app** do Gmail para o SMTP: https://myaccount.google.com/apppasswords
  (requer verificação em duas etapas ativada na conta Google).

## Como criar o bot no Telegram (BotFather)

1. No Telegram, abra uma conversa com [@BotFather](https://t.me/BotFather).
2. Envie `/newbot` e siga as instruções (nome e username terminando em `bot`).
3. Copie o **token** que ele fornece e coloque em `TELEGRAM_BOT_TOKEN` no `.env`.
4. (Opcional, para grupos) Se quiser que o bot leia **todas** as mensagens do grupo, envie `/setprivacy` ao BotFather e desative o "Group Privacy". Caso contrário, em grupos o bot só recebe mensagens onde é **mencionado** (`@seubot`) ou que **respondem** a ele — que já é o comportamento padrão deste projeto.

## Instalação

```bash
cd telegram-pergunta-bot
npm install
cp .env.example .env
# edite o .env com o token do bot e as credenciais SMTP
```

## Configuração (`.env`)

| Variável | Descrição |
|---|---|
| `OWNER_NAME` | Seu nome, usado nas mensagens automáticas. |
| `TELEGRAM_BOT_TOKEN` | Token do bot, obtido com o @BotFather. |
| `ONLY_WHEN_MENTIONED_IN_GROUPS` | Em grupos, só responde quando o bot for mencionado (@) ou citado (reply). |
| `FORWARD_COOLDOWN_HOURS` | Horas mínimas antes de encaminhar nova pergunta do mesmo chat. |
| `FORWARD_TO_EMAIL` | E-mail de destino das perguntas. |
| `SMTP_USER` / `SMTP_PASS` | E-mail e **senha de app** do Gmail. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Configuração do servidor SMTP (Gmail por padrão). |
| `MAIL_FROM` | Remetente exibido no e-mail. |

## Uso

```bash
npm start
```

Depois, no Telegram, mande uma pergunta para o bot (ou mencione-o num grupo) e ele responderá automaticamente e encaminhará a pergunta para o seu e-mail.

## Rodar 24/7 de graça (sem deixar o PC ligado)

Veja o guia **[HOSPEDAGEM-24-7.md](HOSPEDAGEM-24-7.md)**: publica o bot no **Render** (grátis) e usa o **UptimeRobot** (grátis) para mantê-lo sempre acordado. O projeto já inclui um servidor de saúde (health check) e um `render.yaml` para facilitar.

## Como o bot detecta uma "pergunta"

Heurística simples (em `src/utils.js`):
- a mensagem contém `?`; **ou**
- começa com palavras interrogativas (qual, quando, como, onde, por que, quem, quanto, pode, consegue, etc.).

- Em **conversa privada**: toda pergunta é tratada como direcionada a você.
- Em **grupos**: por padrão, só quando o bot é mencionado (`@seubot`) ou a mensagem responde a ele.

## Estrutura

```
telegram-pergunta-bot/
  src/
    index.js     # conecta ao Telegram (polling) e processa as mensagens
    config.js    # lê as variáveis do .env
    utils.js     # detecção de pergunta e cooldown
    email.js     # envio de e-mail via SMTP (nodemailer)
```

## Avisos importantes

- Use uma **senha de app** do Gmail em `SMTP_PASS` (não a senha normal da conta).
- Nunca comite seu arquivo `.env` (já está no `.gitignore`).
