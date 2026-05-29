# WhatsApp — Bots de Ausência e Encaminhamento de Perguntas

Dois bots para WhatsApp construídos com [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js):

1. **Bot de aviso de ausência** — responde automaticamente avisando que você está ausente e geralmente só acessa o WhatsApp no final de semana.
2. **Bot de encaminhamento de perguntas** — quando alguém faz uma pergunta direcionada a você, responde que você responderá prontamente assim que tomar ciência e **encaminha a pergunta por e-mail** (padrão: `ze.rosquinha3@gmail.com`).

> ℹ️ Os dois bots rodam na **mesma conexão** de WhatsApp, pois um número só pode ter uma sessão Web ativa por vez. Cada bot pode ser ligado/desligado de forma independente pelo `.env`.

## Como funciona

- Usa o **WhatsApp Web** (não-oficial). Você conecta escaneando um QR code uma única vez; a sessão fica salva em `.wwebjs_auth/`.
- O e-mail é enviado via **SMTP do Gmail** usando [nodemailer](https://nodemailer.com/).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior.
- Um número de WhatsApp (de preferência um dedicado/secundário).
- Uma **Senha de app** do Gmail para o SMTP: https://myaccount.google.com/apppasswords
  (requer verificação em duas etapas ativada na conta Google).

## Instalação

```bash
cd whatsapp-ausencia-bot
npm install
cp .env.example .env
# edite o .env com suas credenciais SMTP
```

## Configuração (`.env`)

| Variável | Descrição |
|---|---|
| `OWNER_NAME` | Seu nome, usado nas mensagens automáticas. |
| `ENABLE_AWAY_NOTICE` | Liga/desliga o Bot 1 (aviso de ausência). |
| `SKIP_AWAY_ON_WEEKEND` | Não envia o aviso nos fins de semana (você costuma estar online). |
| `AWAY_COOLDOWN_HOURS` | Horas mínimas antes de reenviar o aviso ao mesmo contato. |
| `ENABLE_FORWARD_QUESTIONS` | Liga/desliga o Bot 2 (encaminhamento). |
| `FORWARD_TO_EMAIL` | E-mail de destino das perguntas. |
| `FORWARD_ONLY_WHEN_MENTIONED_IN_GROUPS` | Em grupos, só encaminha quando o bot for mencionado (@). |
| `FORWARD_COOLDOWN_HOURS` | Horas mínimas antes de encaminhar nova pergunta do mesmo contato. |
| `SMTP_USER` / `SMTP_PASS` | E-mail e **senha de app** do Gmail. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Configuração do servidor SMTP (Gmail por padrão). |
| `MAIL_FROM` | Remetente exibido no e-mail. |

## Uso

```bash
npm start
```

Na primeira execução, escaneie o QR code que aparece no terminal:
**WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho.**

Depois disso a sessão fica salva e não precisa escanear de novo.

## Como o Bot 2 detecta uma "pergunta"

Heurística simples (em `src/utils.js`):
- a mensagem contém `?`; **ou**
- começa com palavras interrogativas (qual, quando, como, onde, por que, quem, quanto, pode, consegue, etc.).

Em **grupos**, por padrão só encaminha quando o bot é mencionado, para evitar ruído.

## Estrutura

```
whatsapp-ausencia-bot/
  src/
    index.js                 # conecta ao WhatsApp e direciona as mensagens
    config.js                # lê as variáveis do .env
    utils.js                 # detecção de pergunta, fim de semana, cooldown
    email.js                 # envio de e-mail via SMTP (nodemailer)
    handlers/
      awayNotice.js          # Bot 1: aviso de ausência
      forwardQuestion.js     # Bot 2: encaminhamento por e-mail
```

## Avisos importantes

- O `whatsapp-web.js` é uma biblioteca **não-oficial**. Use com bom senso (cooldowns já evitam spam) para reduzir risco de bloqueio. Para uso profissional/em escala, considere a [WhatsApp Cloud API oficial](https://developers.facebook.com/docs/whatsapp/cloud-api).
- Nunca comite seu arquivo `.env` (já está no `.gitignore`).
