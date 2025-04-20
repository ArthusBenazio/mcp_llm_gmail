## 🔧 Google Workspace MCP Server

Este é o servidor MCP (Model Context Protocol) que implementa ferramentas para interação com serviços do Google Workspace, como **Gmail** e **Google Calendar**, expondo funções utilizáveis por LLMs (modelos de linguagem) via protocolo MCP. Ele se comunica com o backend através de `stdio`, sendo usado como uma "external tool server".

---

### 🚀 Como iniciar o projeto

> Requisitos:
> - Node.js >= 18
> - pnpm (ou npm/yarn)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/google-workspace-mcp-server.git
cd google-workspace-mcp-server

# 2. Instale dependências
pnpm install

# 3. Configure o .env
cp .env.example .env
# (preencha com as credenciais corretas)

# 4. Compile o projeto
pnpm build

# 5. Execute (modo CLI MCP)
node dist/index.js
```

---

### 🔌 Variáveis de ambiente `.env`

```env
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REFRESH_TOKEN=token-de-atualizacao
```

> Todas essas variáveis são obrigatórias para autenticar a API do Google.

---

### 🔑 Como gerar as credenciais do Gmail (OAuth2)

1. Acesse: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Crie um projeto (ou selecione um existente)
3. Ative as APIs:
   - Gmail API
   - Google Calendar API
4. Navegue para **APIs e Serviços > Tela de consentimento OAuth**
   - Escolha "Interno" ou "Externo"
   - Adicione informações como nome do app, escopos, etc.
5. Acesse **Credenciais** e crie um novo **ID de cliente OAuth 2.0**:
   - Tipo: "Aplicativo da Web"
   - Redirecionamento temporário: `http://localhost`
6. Copie o **Client ID** e **Client Secret**

---

### 🌐 Como gerar o Refresh Token

Utilize um script de autorização temporário (Node.js):

```ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  'SEU_CLIENT_ID',
  'SEU_CLIENT_SECRET',
  'http://localhost'
);

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar',
  ],
});

console.log("Acesse:", url);

// Depois de autorizar, troque o code pelo refresh_token
// const { tokens } = await oauth2Client.getToken(code);
```

> Copie o `refresh_token` e adicione ao `.env`.

---

### 📂 Estrutura do Projeto

```
google-workspace-mcp-server/
├── src/
│   └── index.ts           # Servidor principal MCP com Gmail + Calendar
├── .env.example             # Modelo de variáveis de ambiente
├── package.json             # Dependências e scripts
└── tsconfig.json            # Configuração TypeScript
```

---

### 🔊 Ferramentas MCP implementadas

- `list_emails`
- `search_emails`
- `send_email`
- `modify_email`
- `list_events`
- `create_event`
- `update_event`
- `delete_event`

Cada uma dessas ferramentas define seu `inputSchema` e é acessável via chamadas `callTool` do protocolo MCP.

---

### 🛠 Integração com o ecossistema

Este servidor MCP deve ser conectado via `StdioClientTransport` no backend (Fastify):

```ts
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["../google-workspace-mcp-server/build/index.js"]
});
```

> A comunicação é feita via `stdio`, como especificado pelo protocolo MCP SDK.

---

### 🚫 Possíveis erros comuns

- `invalid_grant`: refresh token incorreto ou expirado
- `Missing required environment variables`: faltam variáveis no `.env`
- `Tool not found`: ferramenta não registrada no servidor

---



## 📂 Backend MCP Chat – Fastify + OpenAI + MCP

Este projeto é o backend da aplicação de chat integrada ao Model Context Protocol (MCP). Ele tem como objetivo intermediar a comunicação entre o frontend, o modelo de linguagem (OpenAI), e ferramentas externas acessíveis via servidor MCP.

---

### 🚼 Para que serve este backend?

- Expõe um endpoint HTTP `/chat` para receber mensagens do frontend.
- Envia mensagens para o modelo OpenAI GPT-4 com suporte ao uso de "tools" (ferramentas externas).
- Conecta-se ao servidor MCP via `StdioClientTransport`.
- Executa chamadas a ferramentas (como Gmail, Calendar, etc.) registradas no servidor MCP.
- Retorna para o frontend uma resposta textual unificada, combinando a resposta do modelo com os resultados das ferramentas.

---

### 🚀 Como iniciar o projeto

> Requisitos:
> - Node.js >= 18
> - pnpm (ou npm/yarn)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mcp-backend.git
cd mcp-backend

# 2. Instale as dependências
pnpm install
# ou
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env

# 4. Compile o servidor MCP (caso esteja em modo build)
cd ../google-workspace-mcp-server
pnpm build
cd ../mcp-backend

# 5. Rode o backend
pnpm dev
# ou
npx tsx index.ts
```

> O backend estará disponível em: [http://localhost:3001/chat](http://localhost:3001/chat)

---

### 🔌 Estrutura do Projeto

```
backend/
├── index.ts               # Arquivo principal (Fastify + MCP + OpenAI)
├── .env.example           # Variáveis de ambiente
├── package.json           # Scripts e dependências
└── tsconfig.json          # Configuração TypeScript
```

---

### 📁 Principais Dependências

- [`fastify`](https://fastify.dev/): servidor HTTP de alta performance
- [`dotenv`](https://github.com/motdotla/dotenv): gerenciamento de variáveis de ambiente
- [`openai`](https://www.npmjs.com/package/openai): SDK oficial da OpenAI
- [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk): SDK para comunicação via MCP
- [`@fastify/cors`](https://github.com/fastify/fastify-cors): suporte CORS

---

### 🔹 Endpoint `/chat`

Este é o único endpoint exposto no backend:

#### Request
```http
POST /chat
Content-Type: application/json

{
  "message": "Qual a minha agenda de hoje?"
}
```

#### Behavior:
- O backend monta a estrutura `messages` para o modelo:
  ```ts
  const messages = [{ role: 'user', content: message }]
  ```
- Realiza a chamada `openai.chat.completions.create()` com `tools` listadas pelo MCP.
- Se houver chamadas de ferramentas (`tool_calls`), executa cada uma via:
  ```ts
  mcpClient.callTool({ name, arguments })
  ```
- Concatena todas as saídas num texto único e retorna:

#### Response
```json
{
  "response": "[Tool calendar.findEvents]\nCompromissos para hoje:\n- Reunião com equipe 14h\n\nAqui está sua agenda."
}
```

---

### 📚 Variáveis de Ambiente (`.env`)

```env
OPENAI_API_KEY=sk-...
```

Outras variáveis podem ser necessárias dependendo da autenticação com o servidor MCP.

---

### 🛠 Faz parte do ecossistema MCP

Este backend integra com:

- 🔗 **Frontend React + Vite** – Interface do usuário do chat
- 🛠 **Servidor MCP** – Executa ferramentas externas via protocolo Model Context Protocol




## 📘 Frontend MCP Chat – React + Vite

Este projeto representa a interface do usuário do sistema MCP (Model Context Protocol), um chat interativo que permite ao usuário enviar mensagens para um modelo de linguagem (via backend Fastify) com suporte a ferramentas externas através do protocolo MCP. Desenvolvido com **React + Vite**, este frontend implementa uma experiência de chat moderna, responsiva e integrada com rolagem automática, histórico de mensagens e controle de envio via `Enter`.

---

### 📂 Estrutura do Projeto

```
frontend/
├── src/
│   ├── App.tsx             # Componente principal do chat
│   ├── App.css             # Estilos globais e componentes
│   └── main.tsx            # Ponto de entrada do React
├── index.html              # HTML principal
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração TypeScript
└── vite.config.ts          # Configuração do Vite
```

---

### ⚙️ Tecnologias Utilizadas

- [React](https://reactjs.org/) com TypeScript
- [Vite](https://vitejs.dev/) para desenvolvimento rápido
- [Axios](https://axios-http.com/) para requisições HTTP
- `useState`, `useEffect`, `useRef` para gerenciamento de estado e rolagem automática
- Integração com backend `http://localhost:3001/chat`

---

### 🚀 Como iniciar o projeto

> Pré-requisitos:
> - Node.js >= 18
> - pnpm (ou npm/yarn)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mcp-frontend.git
cd mcp-frontend

# 2. Instale as dependências
pnpm install
# ou
npm install
# ou
yarn install

# 3. Rode o servidor de desenvolvimento
pnpm dev
# ou
npm run dev
```

> O app estará disponível em: [http://localhost:5173](http://localhost:5173)

---

### 🧠 O que esse projeto faz

- Interface de chat que envia mensagens ao backend MCP
- Renderiza um histórico de mensagens do tipo:
  - `role: 'user'`: mensagem enviada pelo usuário
  - `role: 'assistant'`: resposta do modelo (OpenAI ou outra LLM)
- Scroll automático até a última mensagem
- Envio da mensagem com **Enter** (e quebra de linha com Shift+Enter)
- Layout responsivo com estilização moderna (modo escuro por padrão)
- Otimizado para uso com servidor MCP em Node.js conectado ao backend

---

### 🎭 Fluxo da mensagem

1. Usuário digita uma mensagem no `textarea`.
2. Ao pressionar Enter ou clicar em "Enviar":
   - A mensagem é adicionada ao histórico com role `user`.
   - Uma requisição `POST` é enviada para `http://localhost:3001/chat`.
   - O backend responde com o conteúdo gerado pela LLM.
   - A resposta é exibida abaixo da mensagem do usuário.

---

### 🎨 Estilo

Os estilos estão definidos em `App.css`, com uso de:

- `chat-box`: área de rolagem do chat
- `user-message` / `assistant-message`: cores diferentes para remetente
- `input-form`: campo de input e botão
- `scrollIntoView`: rolagem automática para a última mensagem

---

### 🔧 Ambiente de Desenvolvimento

- ✅ Hot Reload com Vite
- ✅ Suporte a TypeScript nativo
- ✅ CSS escopado e responsivo
- ✅ Ideal para integração com backend e servidor MCP

---

### 📦 Scripts disponíveis

```bash
pnpm dev        # Inicia o frontend com Vite
pnpm build      # Gera o build de produção
pnpm preview    # Serve o build localmente para teste
```

---

### 📁 Integração com o Backend

Este projeto depende de um backend rodando localmente na porta `3001`, com um endpoint `/chat`. O backend deve estar preparado para:
- Receber uma mensagem no corpo da requisição `{ message: string }`
- Retornar uma resposta estruturada em `{ response: string }`

---

### 🪠 Faz parte do ecossistema MCP

Este frontend integra com:

- 🧠 **[Backend Fastify](../backend)** – Processa as requisições, interage com OpenAI API e MCP
- 🛠 **[Servidor MCP personalizado](../mcp-server)** – Protocolo MCP com ferramentas como Gmail/Calendar

---

