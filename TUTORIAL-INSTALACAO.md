# 📖 Tutorial de Instalação (Windows) — passo a passo para iniciantes

Este guia mostra como colocar os dois bots para funcionar no seu **Windows**:

- 📱 **Bot de aviso de ausência** (WhatsApp) → pasta `whatsapp-ausencia-bot`
- ✈️ **Bot de perguntas** (Telegram) → pasta `telegram-pergunta-bot`

> Faça com calma, na ordem. Cada passo tem o que digitar e o que esperar.

---

## ✅ Parte 0 — Instalar o Node.js (só na primeira vez)

Os bots são programas feitos em JavaScript e precisam do **Node.js** para rodar.

1. Abra o navegador e vá em: **https://nodejs.org/**
2. Clique no botão grande que diz **"LTS"** (versão recomendada). Vai baixar um arquivo `.msi`.
3. Abra o arquivo baixado e clique **Next → Next → ... → Install** (pode aceitar tudo no padrão). No final, clique **Finish**.
4. Para conferir se instalou: aperte a tecla **Windows**, digite `cmd` e abra o **Prompt de Comando**. Na janela preta que abrir, digite:
   ```
   node --version
   ```
   e tecle **Enter**. Se aparecer algo como `v22.x.x`, deu certo! ✅

> 💡 Essa "janela preta" é o **Prompt de Comando** (terminal). Vamos usá-la em vários passos. Para colar texto nela: clique com o **botão direito** do mouse.

---

## ✅ Parte 1 — Baixar o código dos bots

1. No GitHub, abra a página do seu repositório.
2. Clique no botão verde **`< > Code`** → **Download ZIP**.
3. Salve o ZIP, por exemplo, na sua **Área de Trabalho**.
4. Clique com o botão direito no ZIP → **Extrair tudo...** → **Extrair**.
5. Você terá uma pasta (por ex. `awesome-ai-agents`) com as pastas `whatsapp-ausencia-bot` e `telegram-pergunta-bot` dentro.

> Anote o caminho dessa pasta. Exemplo: `C:\Users\SeuNome\Desktop\awesome-ai-agents`

---

## ✈️ Parte 2 — Configurar o BOT DO TELEGRAM

### 2.1 — Criar o bot no Telegram e pegar o "token"

1. No celular ou no Telegram do PC, procure pelo contato **@BotFather** (tem um selo azul de verificado).
2. Abra a conversa e clique em **Iniciar / Start**.
3. Envie a mensagem: `/newbot`
4. Ele vai pedir um **nome** para o bot (pode ser qualquer um, ex.: `Avisos do Zé`).
5. Depois vai pedir um **username**, que precisa **terminar em `bot`** (ex.: `avisos_do_ze_bot`). Se já existir, tente outro.
6. Pronto! Ele responde com uma mensagem contendo o **token**, algo assim:
   ```
   123456789:ABCdefGhIjKlMnOpQrStUvWxYz1234567890
   ```
   **Copie e guarde esse token** — vamos usar daqui a pouco. (Não mostre para ninguém: quem tem o token controla o bot.)

### 2.2 — Criar a "Senha de app" do Gmail (para o bot enviar e-mail)

O bot vai enviar as perguntas para o e-mail `ze.rosquinha3@gmail.com`. Para isso, o Gmail exige uma **senha de app** (não é a senha normal da sua conta).

1. Acesse: **https://myaccount.google.com/security**
2. Ative a **Verificação em duas etapas** (se ainda não estiver ativa). É obrigatório para o próximo passo.
3. Depois acesse: **https://myaccount.google.com/apppasswords**
4. Em "Nome do app", digite algo como `Bot Telegram` e clique em **Criar**.
5. O Google vai mostrar uma senha de **16 letras** (ex.: `abcd efgh ijkl mnop`).
   **Copie essa senha** (pode tirar os espaços: `abcdefghijklmnop`). Vamos usá-la.

### 2.3 — Preencher o arquivo de configuração (`.env`)

1. Abra a pasta `telegram-pergunta-bot`.
2. Encontre o arquivo chamado **`.env.example`**.
3. Faça uma **cópia** dele e renomeie a cópia para **`.env`** (só isso, sem `.example`).
   - *Dica:* se o Windows esconder a extensão, abra o Explorador de Arquivos → menu **Exibir** → marque **Extensões de nomes de arquivos**.
4. Abra o `.env` com o **Bloco de Notas** (botão direito → Abrir com → Bloco de Notas).
5. Preencha estas linhas (deixe as outras como estão):
   ```
   OWNER_NAME=Zé
   TELEGRAM_BOT_TOKEN=cole-aqui-o-token-do-BotFather
   FORWARD_TO_EMAIL=ze.rosquinha3@gmail.com
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=a-senha-de-app-de-16-letras
   ```
   - `SMTP_USER` = o e-mail do Gmail de onde os e-mails vão **sair** (pode ser o seu próprio).
   - `SMTP_PASS` = a senha de app de 16 letras do passo 2.2.
6. Salve o arquivo (**Arquivo → Salvar**) e feche.

### 2.4 — Instalar e ligar o bot do Telegram

1. Abra o **Prompt de Comando** (tecla Windows → digite `cmd` → Enter).
2. Entre na pasta do bot. Digite `cd ` (com espaço) e **arraste a pasta `telegram-pergunta-bot`** para dentro da janela — o caminho aparece sozinho. Tecle **Enter**. Exemplo:
   ```
   cd C:\Users\SeuNome\Desktop\awesome-ai-agents\telegram-pergunta-bot
   ```
3. Instale as dependências (só precisa na primeira vez):
   ```
   npm install
   ```
   Espere terminar (aparece "added ... packages").
4. Ligue o bot:
   ```
   npm start
   ```
   Se tudo deu certo, aparece algo como:
   ```
   [telegram] conectado como @seu_bot ✅
     Encaminhando perguntas para: ze.rosquinha3@gmail.com
   ```
5. **Teste:** no Telegram, procure o seu bot pelo username (`@avisos_do_ze_bot`), clique em **Iniciar** e mande uma pergunta, por exemplo: `Você está aí?`. O bot deve responder automaticamente, e em segundos deve chegar um e-mail em `ze.rosquinha3@gmail.com`. 🎉

> ⛔ **Para desligar o bot:** clique na janela do Prompt e aperte **Ctrl + C**.
> Enquanto a janela estiver aberta e rodando, o bot funciona. Se fechar a janela ou desligar o PC, ele para.

---

## 📱 Parte 3 — Configurar o BOT DO WHATSAPP (aviso de ausência)

### 3.1 — Preparar a configuração (opcional)

Esse bot **não precisa de e-mail nem de token**, então a configuração é opcional.

1. Na pasta `whatsapp-ausencia-bot`, copie o `.env.example` e renomeie a cópia para `.env` (igual fizemos no Telegram).
2. (Opcional) Abra no Bloco de Notas e ajuste, por exemplo, `OWNER_NAME=Zé`. Pode deixar o resto como está.

### 3.2 — Instalar e ligar o bot do WhatsApp

1. Abra **outra** janela do Prompt de Comando (a do Telegram pode ficar aberta rodando).
2. Entre na pasta do bot (mesma técnica do arrastar):
   ```
   cd C:\Users\SeuNome\Desktop\awesome-ai-agents\whatsapp-ausencia-bot
   ```
3. Instale (só na primeira vez — pode demorar mais, pois baixa um navegador interno):
   ```
   npm install
   ```
4. Ligue o bot:
   ```
   npm start
   ```
5. Vai aparecer um **QR code** desenhado na janela preta.
6. No **celular**, abra o **WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho** e **aponte a câmera para o QR code** na tela do PC.
7. Quando conectar, aparece:
   ```
   [whatsapp] conectado e pronto! ✅
   ```
8. **Teste:** peça para alguém te mandar uma mensagem no WhatsApp (ou use outro número). O bot responde automaticamente com o aviso de ausência. 🎉

> O QR só precisa ser escaneado **uma vez**. Depois a sessão fica salva no PC.
> Para desligar: **Ctrl + C** na janela. Para religar: `npm start` de novo.

---

## ❓ Problemas comuns

| Problema | Solução |
|---|---|
| `'node' não é reconhecido...` | O Node.js não foi instalado ou o Prompt foi aberto antes de instalar. Reinstale o Node e abra um Prompt **novo**. |
| `'npm' não é reconhecido...` | Mesmo motivo acima — feche e abra o Prompt de novo após instalar o Node. |
| Telegram: `token invalido` | Confira se copiou o token completo do BotFather no `.env`, sem espaços extras. |
| E-mail não chega | Verifique `SMTP_USER`/`SMTP_PASS`. A senha **tem que ser** a "senha de app" de 16 letras, não a senha normal do Gmail. Veja também a caixa de Spam. |
| Em grupo do Telegram o bot não responde | Por padrão, em grupos ele só responde quando é **mencionado** (`@seubot`) ou quando **respondem** uma mensagem dele. Para ele ler tudo, fale com o @BotFather → `/setprivacy` → **Disable**. |
| Bot parou ao fechar a janela | É normal: o bot só roda enquanto a janela do Prompt está aberta. Para rodar 24h, seria preciso deixar o PC ligado ou usar um servidor (posso te ajudar com isso depois). |

---

## 💡 Resumo rápido (depois de já ter instalado uma vez)

Para **ligar** os bots de novo, é só abrir o Prompt, entrar na pasta e rodar `npm start`:

```
cd caminho\da\pasta\telegram-pergunta-bot
npm start
```
```
cd caminho\da\pasta\whatsapp-ausencia-bot
npm start
```

Para **desligar**: `Ctrl + C` na janela.
