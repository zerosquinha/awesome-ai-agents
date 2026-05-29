# ☁️ Como deixar o bot do Telegram rodando 24/7 de graça (Render + UptimeRobot)

Este guia coloca o **bot do Telegram** no ar **24 horas por dia, 7 dias por semana, de graça**, sem precisar deixar seu PC ligado.

> 📱 O **bot do WhatsApp** continua rodando no seu PC (ver `../whatsapp-ausencia-bot`). Ele usa uma biblioteca não-oficial e **não é recomendado** rodar 24/7 na nuvem (risco de bloqueio do número).

## Como funciona (em 1 minuto)

- O **Render** hospeda o bot de graça. Porém, no plano grátis, ele "dorme" após ~15 minutos sem ninguém acessar.
- O **UptimeRobot** (também grátis) acessa o endereço do bot a cada 5 minutos, mantendo-o **sempre acordado**.
- Juntos, os dois deixam o bot online 24/7 sem custo.

> O código já vem preparado com um "endereço de saúde" (health check) que o Render e o UptimeRobot usam. Você não precisa programar nada.

---

## Pré-requisitos (você já deve ter dos passos anteriores)

- ✅ O **token** do bot do Telegram (criado no @BotFather).
- ✅ A **senha de app** do Gmail (16 letras).
- ✅ O código no **GitHub** (já está no seu repositório).

Se ainda não tiver o token ou a senha de app, veja o `../TUTORIAL-INSTALACAO.md`, partes 2.1 e 2.2.

---

## Parte 1 — Publicar no Render

1. Acesse **https://render.com** e clique em **Get Started** / **Sign in**.
2. Escolha **"Sign in with GitHub"** e autorize o Render a acessar seus repositórios.
3. No painel do Render, clique em **New +** (canto superior) → **Web Service**.
4. Selecione o seu repositório (`awesome-ai-agents`). Se não aparecer, clique em **Configure account** e dê acesso a ele.
5. Preencha os campos assim:
   | Campo | Valor |
   |---|---|
   | **Name** | `telegram-pergunta-bot` (ou o que quiser) |
   | **Root Directory** | `telegram-pergunta-bot` |
   | **Runtime / Language** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | **Free** |
6. Role até a seção **Environment Variables** e adicione estas (botão **Add Environment Variable**):
   | Key (nome) | Value (valor) |
   |---|---|
   | `TELEGRAM_BOT_TOKEN` | *o token do @BotFather* |
   | `SMTP_USER` | *seu e-mail @gmail.com* |
   | `SMTP_PASS` | *a senha de app de 16 letras* |
   | `FORWARD_TO_EMAIL` | `ze.rosquinha3@gmail.com` |
   | `OWNER_NAME` | `Zé` |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_SECURE` | `true` |

   > ⚠️ Coloque o token e as senhas **somente aqui** (no painel do Render). Nunca escreva esses valores em arquivos que vão para o GitHub.
7. Clique em **Create Web Service** (ou **Deploy**).
8. Espere alguns minutos. Nos **Logs** (aba à esquerda), quando aparecer algo como:
   ```
   [telegram] conectado como @seu_bot ✅
   [health] servidor de saude ouvindo na porta ...
   ```
   o bot está no ar! 🎉
9. No topo da página do serviço, o Render mostra a **URL pública** dele, algo como:
   ```
   https://telegram-pergunta-bot.onrender.com
   ```
   **Copie essa URL** — vamos usá-la na Parte 2.

> 💡 **Atalho (opcional):** este projeto inclui um arquivo `render.yaml`. Em vez dos passos 3–6, você pode ir em **New + → Blueprint**, escolher o repositório, e o Render lê as configurações sozinho. Você só precisará preencher os 3 segredos (token, SMTP_USER, SMTP_PASS).

---

## Parte 2 — Manter acordado com o UptimeRobot

1. Acesse **https://uptimerobot.com** e crie uma conta grátis (**Register / Sign Up**).
2. Confirme seu e-mail e entre no painel.
3. Clique em **+ New monitor** (ou **Add New Monitor**).
4. Preencha:
   | Campo | Valor |
   |---|---|
   | **Monitor Type** | `HTTP(s)` |
   | **Friendly Name** | `Bot Telegram` |
   | **URL (or IP)** | *a URL do Render que você copiou* (ex.: `https://telegram-pergunta-bot.onrender.com`) |
   | **Monitoring interval** | `5 minutes` |
5. Clique em **Create Monitor**.

Pronto! O UptimeRobot agora acessa seu bot a cada 5 minutos, e ele nunca mais "dorme". ✅

---

## Parte 3 — Testar

1. No Telegram, abra a conversa com o seu bot e mande uma pergunta, ex.: `Tudo certo?`.
2. O bot deve responder automaticamente.
3. Em segundos, deve chegar um e-mail em `ze.rosquinha3@gmail.com`.

Para testar de verdade o 24/7: feche tudo, espere algumas horas (ou no dia seguinte) e mande outra pergunta. Ele deve continuar respondendo mesmo com seu PC desligado.

---

## ❓ Problemas comuns

| Problema | Solução |
|---|---|
| Build falhou no Render | Confira se **Root Directory** = `telegram-pergunta-bot` e **Start Command** = `npm start`. |
| Logs: `token invalido` | O `TELEGRAM_BOT_TOKEN` foi digitado errado nas Environment Variables. Corrija e clique em **Manual Deploy → Deploy latest commit**. |
| Bot demora ~50s para responder na 1ª vez | É o serviço "acordando". Depois que o UptimeRobot estiver ativo, isso para de acontecer. |
| E-mail não chega | Revise `SMTP_USER` / `SMTP_PASS` (senha de app, não a senha normal). Veja a caixa de Spam. |
| Quero atualizar o bot | Faça o push das mudanças no GitHub; o Render reimplanta sozinho (ou use **Manual Deploy**). |

---

## 💰 Sobre o "de graça"

- **Render Free**: 750 horas/mês de execução (suficiente para 1 serviço 24/7) e sem custo. Pode haver um pequeno período de manutenção/reinício ocasional — normal no plano grátis.
- **UptimeRobot Free**: até 50 monitores, checagem a cada 5 min. Mais que suficiente.
- Nenhum dos dois pede cartão de crédito para o plano grátis.
