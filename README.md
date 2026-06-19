# GastôMeter — Projeto Fullstack (ES47B)

Aplicação web em 3 camadas para controle de gastos pessoais com login, busca no servidor e inserção via API REST.

## Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows)

## Primeira vez — setup completo

Na pasta raiz do projeto:

```bash
# 1. Copiar variáveis do backend (só na primeira vez)
copy backend\.env.example backend\.env

# 2. Instalar dependências + subir banco + criar tabelas
npm run setup
```

## Banco de dados com Docker

O arquivo `docker-compose.yml` sobe um PostgreSQL local sem instalar o banco no Windows.

| Comando | O que faz |
|---------|-----------|
| `npm run docker:up` | Liga o banco (container `gastometer-db`) |
| `npm run docker:down` | Desliga o banco |
| `npm run docker:logs` | Mostra logs do PostgreSQL |
| `npm run docker:reset` | Apaga tudo e recria o banco do zero |
| `npm run db:seed` | Cria tabelas + usuário demo |

Credenciais padrão (já no `.env.example`):

- Host: `localhost:5432`
- Banco: `gastometer`
- Usuário/senha: `postgres` / `postgres`

## Executar a aplicação

```bash
# Terminal 1 — API
npm run dev:backend

# Terminal 2 — Frontend
npm run dev:frontend
```

Ou no VS Code/Cursor: **F5** → `Full Stack (Front + Back)`

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

**Login demo:** `admin@gastometer.com` / `admin123`

## API

| Método | Rota | Auth |
|--------|------|------|
| POST | `/api/auth/login` | Não |
| POST | `/api/auth/logout` | Não |
| GET | `/api/expenses` | Sim |
| POST | `/api/expenses` | Sim |
| DELETE | `/api/expenses/:id` | Sim |
