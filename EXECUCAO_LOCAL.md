# Execução local — GastôMeter

Guia passo a passo para rodar o projeto na sua máquina (Windows).

## O que você vai subir

| Serviço        | Tecnologia          | Porta  | Pasta                |
| -------------- | ------------------- | ------ | -------------------- |
| Frontend       | React + Vite        | `5173` | `frontend/`          |
| Backend        | Node.js + Express   | `3001` | `backend/`           |
| Banco de dados | PostgreSQL (Docker) | `5432` | `docker-compose.yml` |

---

## Pré-requisitos

Instale antes de começar:

1. **[Node.js 18+](https://nodejs.org/)** — verifique com `node -v`
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** —
   precisa estar **aberto e rodando** antes de subir o banco
3. **Git** (opcional) — para clonar o repositório

---

## Primeira execução (setup completo)

Abra o terminal na **pasta raiz** do projeto (onde estão `frontend/`, `backend/`
e `docker-compose.yml`).

### 1. Criar o arquivo de ambiente do backend

**PowerShell (Windows):**

```powershell
Copy-Item backend\.env.example backend\.env
```

**CMD:**

```cmd
copy backend\.env.example backend\.env
```

O arquivo `backend/.env` já vem com as credenciais compatíveis com o Docker
local. Só altere se souber o que está fazendo.

### 2. Instalar dependências, subir banco e popular dados

```powershell
npm run setup
```

Esse comando executa, em sequência:

- `npm install` no frontend e no backend
- `docker compose up -d --wait` — sobe o PostgreSQL
- `npm run db:seed` — cria tabelas, usuário demo e dados de exemplo

### 3. Iniciar backend e frontend

Use **dois terminais** (recomendado no Windows):

**Terminal 1 — API:**

```powershell
npm run dev:backend
```

Aguarde a mensagem:

```text
[database] Conexão com o banco estabelecida.
[server] API rodando em http://localhost:3001
```

**Terminal 2 — Frontend:**

```powershell
npm run dev:frontend
```

Aguarde a URL do Vite (geralmente `http://localhost:5173`).

### 4. Acessar no navegador

- **Aplicação:** http://localhost:5173
- **Health check da API:** http://localhost:3001/api/health

**Credenciais de demonstração:**

| Campo  | Valor                  |
| ------ | ---------------------- |
| E-mail | `admin@gastometer.com` |
| Senha  | `admin123`             |

---

## Execução pelo VS Code

Com a extensão de debug configurada no projeto:

1. Abra a pasta raiz no editor
2. Pressione **F5**
3. Escolha **Full Stack (Front + Back)**

Isso inicia backend e frontend em paralelo.

Tarefas disponíveis em **Terminal → Executar Tarefa**:

| Tarefa                | Descrição                    |
| --------------------- | ---------------------------- |
| `Full Stack: dev`     | Backend + frontend juntos    |
| `Backend: dev`        | Só a API                     |
| `Frontend: dev`       | Só o React                   |
| `Docker: subir banco` | Liga o PostgreSQL            |
| `Database: seed`      | Recria schema + dados demo   |
| `Setup completo`      | Instala tudo + Docker + seed |

---

## Comandos úteis (pasta raiz)

| Comando                | O que faz                            |
| ---------------------- | ------------------------------------ |
| `npm run install:all`  | Instala dependências do front e back |
| `npm run dev:backend`  | API com hot reload (`node --watch`)  |
| `npm run dev:frontend` | Vite dev server                      |
| `npm run build`        | Build de produção do frontend        |
| `npm run docker:up`    | Sobe o PostgreSQL                    |
| `npm run docker:down`  | Para o container do banco            |
| `npm run docker:logs`  | Logs do PostgreSQL                   |
| `npm run docker:reset` | Apaga volume e recria banco do zero  |
| `npm run db:seed`      | Aplica `schema.sql` + dados demo     |

---

## Banco de dados (Docker)

O `docker-compose.yml` cria um container PostgreSQL 16:

- **Container:** `gastometer-db`
- **Host:** `localhost`
- **Porta:** `5432`
- **Banco:** `gastometer`
- **Usuário:** `postgres`
- **Senha:** `postgres`

### Recriar banco do zero

Se algo der errado nas tabelas ou quiser limpar tudo:

```powershell
npm run docker:reset
npm run db:seed
```

---

## HTTPS local (opcional)

Por padrão a API roda em **HTTP** (`USE_HTTPS=false` no `.env`).

Para testar HTTPS:

```powershell
cd backend
npm run certs:generate
```

No `backend/.env`, altere:

```env
USE_HTTPS=true
```

Reinicie o backend. A API passará a responder em `https://localhost:3001`.

> Certificados autoassinados podem gerar aviso no navegador — é normal em
> desenvolvimento.

---

## Estrutura do monorepo

```text
Projeto_Full_Stack-main/
├── frontend/          # React (SPA)
├── backend/           # Express + PostgreSQL
├── docker-compose.yml # Banco local
├── package.json       # Scripts da raiz
└── EXECUCAO_LOCAL.md  # Este arquivo
```

O frontend em dev usa proxy: requisições para `/api` são encaminhadas para
`http://localhost:3001` (configurado em `frontend/vite.config.js`).

---

## Problemas comuns

### Docker não conecta / "connection refused"

- Abra o **Docker Desktop** e aguarde ficar verde
- Rode `npm run docker:up` e confira: `docker ps` deve listar `gastometer-db`

### Login falha / "column does not exist"

Reaplique o schema e o seed:

```powershell
npm run db:seed
```

### Porta 3001 ou 5173 já em uso

- Feche outros processos Node/Vite, ou
- Altere `PORT` no `backend/.env` e `VITE_API_PROXY` no ambiente do frontend

### Backend sobe mas frontend não chama a API

- Confirme que o backend está rodando antes do frontend
- Teste: http://localhost:3001/api/health deve retornar `{ "status": "ok" }`

### `npm run dev` na raiz não funciona no Windows

O script usa `&` (Unix). No Windows, prefira **dois terminais** com
`dev:backend` e `dev:frontend`, ou use **F5** no VS Code.

---

## Parar tudo

1. **Ctrl+C** nos terminais do backend e frontend
2. Opcional — parar o banco:

```powershell
npm run docker:down
```

Para remover também os dados persistidos:

```powershell
npm run docker:reset
```
