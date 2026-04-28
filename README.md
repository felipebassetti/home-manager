# flatsharing MVP

MVP de uma plataforma para casas compartilhadas com foco inicial em:

- marketplace de casas, quartos e vagas
- gestao simples de moradores
- cobrancas mensais e controle manual de pagamentos

## Documentacao

- Visao geral: [docs/README.md](C:/Users/Admin/Documents/Github/home-manager/docs/README.md)
- Historias de usuario: [docs/hus/README.md](C:/Users/Admin/Documents/Github/home-manager/docs/hus/README.md)

## Stack

- `apps/web`: Angular SPA
- `apps/api`: Cloudflare Worker com endpoints base
- `supabase/schema.sql`: fonte de verdade do schema
- `pnpm` workspace no root

## Estrutura

```txt
apps/
  web/
    src/app/
      pages/
      components/
      services/
      models/
      data/
  api/
    src/
docs/
  hus/
supabase/
  schema.sql
```

## Fluxos prontos

- listagem de casas com filtros por cidade, bairro e preco
- detalhe da casa com quartos, cobrancas e candidatura
- dashboard basico da casa
- criacao de nova casa pelo admin
- controle manual de pagamentos com status `pending`, `paid` e `overdue`

## Como rodar

Instalacao:

```bash
pnpm install
```

Fluxo padrao, frontend apontando para a API do Worker em modo Cloudflare:

```bash
pnpm dev:cloudflare
```

Fluxo 100% local, frontend + API local:

```bash
pnpm dev:local
```

Se quiser subir cada parte separadamente:

```bash
pnpm dev:web
pnpm dev:api:cloudflare
pnpm dev:api:local
```

App Angular: `http://localhost:4200`

API de desenvolvimento sempre exposta em: `http://127.0.0.1:8787`

Durante `ng serve`, o frontend sempre fala com `/api` e o proxy do Angular redireciona para a porta `8787`. A diferenca entre `cloudflare` e `local` fica no modo do `wrangler dev`:

- `pnpm dev:cloudflare`: `wrangler dev --remote`
- `pnpm dev:local`: `wrangler dev --local`

## Build

```bash
pnpm build
```

## Preparacao para Supabase

O Worker ja aceita:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_ORIGIN`

Arquivo de exemplo:

```txt
apps/api/.dev.vars.example
```

No frontend, a configuracao publica de runtime fica em:

```txt
apps/web/public/runtime-config.js
```

Exemplo para modo real:

```txt
apps/web/public/runtime-config.example.js
```

Schema inicial:

```txt
supabase/schema.sql
```

## Endpoints base do Worker

```txt
GET  /health
GET  /houses
GET  /houses/:id
POST /houses
POST /applications
POST /houses/:id/members
POST /charges
GET  /payments
POST /payments
```

## Proxima fase recomendada

1. Fechar policies de RLS por dominio
2. Evoluir charges e payments para cobranca por morador
3. Integrar Pagar.me no fluxo de cobranca
4. Adicionar testes para permissoes e regras financeiras
