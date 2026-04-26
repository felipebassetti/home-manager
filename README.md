# Republic House MVP

MVP de uma plataforma para casas compartilhadas com foco inicial em:

- marketplace de casas, quartos e vagas
- gestao simples de moradores
- cobrancas mensais e controle manual de pagamentos

Nesta primeira iteracao o projeto esta em **modo mock end to end**. O frontend funciona sem Supabase e sem Cloudflare Workers rodando. A integracao real ja esta preparada para a proxima fase.

## Documentacao

- Visao geral: [docs/README.md](C:/Users/Admin/Documents/Github/home-manager/docs/README.md)
- Historias de usuario: [docs/hus/README.md](C:/Users/Admin/Documents/Github/home-manager/docs/hus/README.md)

## Stack

- `apps/web`: Angular SPA
- `apps/api`: Cloudflare Worker com endpoints base
- `supabase/schema.sql`: schema inicial para a futura integracao
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

## Fluxos prontos no mock

- listagem de casas com filtros por cidade, bairro e preco
- detalhe da casa com quartos, cobrancas e candidatura
- dashboard basico da casa
- criacao de nova casa pelo admin
- controle manual de pagamentos com status `pending`, `paid` e `overdue`
- troca de perfil mockado entre admin, morador e visitante

## Como rodar

No root:

```bash
pnpm install
pnpm dev:web
```

App Angular: `http://localhost:4200`

Se quiser subir o Worker tambem:

```bash
pnpm dev:api
```

Worker local: `http://127.0.0.1:8787`

## Build

```bash
pnpm build
```

## Modo mock

O frontend usa `apps/web/src/environments/environment.ts` com `useMockApi: true`.

Isso significa:

- a SPA abre mesmo sem backend
- criacao de casa, candidatura e alteracao de pagamento funcionam localmente
- os dados vivem em memoria durante a sessao da aplicacao

## Preparacao para Supabase

O Worker ja aceita:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `USE_MOCK_DATA`
- `APP_ORIGIN`

Arquivo de exemplo:

```txt
apps/api/.dev.vars.example
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

1. Conectar Supabase Auth e tabela `profiles`
2. Trocar `useMockApi` para `false`
3. Subir Worker com bindings reais
4. Persistir criacao de casas, membros e cobrancas
5. Integrar Pagar.me no fluxo de cobranca
