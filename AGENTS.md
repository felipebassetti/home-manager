# AGENTS.md

## Project: Republic House

Republic House is a shared housing management platform focused on:

- Marketplace for shared houses
- House management for admins
- Monthly payments tracking

Target users:

- Students
- Shared housing admins

## Monorepo Structure

- `apps/web`: Angular frontend
- `apps/api`: Cloudflare Workers API
- `supabase/schema.sql`: database schema source

## Stack

- Angular 21
- Cloudflare Workers
- Supabase Auth, Database, Storage
- Pagar.me
- pnpm workspace
- TypeScript

## Core Principles

- Keep code simple and MVP-first
- Avoid overengineering and premature abstractions
- Prefer feature-oriented modules over deeply shared abstractions
- Prefer serverless-friendly designs
- Optimize for clarity, maintainability, and fast iteration
- Focus on usability for house admins

## General Engineering Rules

- Keep functions small and explicit
- Prefer composition over inheritance
- Avoid adding dependencies unless they clearly reduce complexity
- Do not create generic helpers too early
- Keep domain names and types consistent across frontend, API, and database
- Validate external input at the boundary
- Never hardcode secrets
- Document important tradeoffs directly in code only when needed

## Frontend Guidelines: Angular

- Prefer standalone components, standalone routing, and modern Angular APIs
- Organize code by feature/domain, not by file type alone
- Keep smart/container logic close to routes and pages
- Keep presentational components simple and reusable
- Prefer reactive forms for non-trivial forms
- Use Angular signals and computed state for local UI state when it keeps code simpler
- Use RxJS only where streams are actually needed; do not introduce reactive complexity by default
- Lazy load feature routes when reasonable
- Keep services focused on a single responsibility
- Centralize API access behind services or data-access layers
- Handle loading, empty, and error states explicitly in UI flows
- Do not store secrets in Angular environment files
- Only expose public anon keys and public URLs in frontend config
- Always design and validate flows for mobile usage too, especially iPhone and iPad form factors
- Treat responsive behavior as a default requirement, not a later refinement
- Prioritize touch-friendly interactions, readable typography, and safe spacing on small screens
- Prefer simple CSS and accessible markup over heavy UI libraries

## Backend Guidelines: Cloudflare Workers

- Keep Workers stateless and request-driven
- Split route handling, business rules, and data access into separate modules
- Use the standard Web Fetch API patterns native to Workers
- Avoid Node-specific packages unless there is a strong reason
- Read secrets and runtime config from Wrangler bindings or env vars
- Keep the worker entrypoint thin
- Return consistent JSON response shapes
- Validate request payloads, params, and auth context at the edge
- Centralize CORS handling and error formatting
- Prefer small, explicit repositories/services over large framework-style layers
- Design endpoints to be idempotent when handling retries, payments, and webhooks
- Log useful operational context, but never log secrets or sensitive personal data

## Database and Auth Guidelines: Supabase

- Treat `supabase/schema.sql` as the source of truth for schema changes
- Keep schema changes explicit, reversible, and reviewed
- Prefer normalized tables and only denormalize when it clearly simplifies reads
- Use row level security for user-scoped data
- Default to least privilege for all database access
- Never expose the Supabase service role key in the frontend
- Use the anon key only for safe client-side operations governed by RLS
- Keep privileged operations in Cloudflare Workers
- Persist auth-sensitive decisions on the server, not only in the client
- Select only the columns needed by each query
- Store money-related values with clear types and consistent currency rules
- Add `created_at` and `updated_at` style audit fields where useful
- Prefer soft deletes only when the product really needs recovery/history

## Storage Guidelines: Supabase Storage

- Default buckets to private unless public access is clearly required
- Validate file type and size before upload flows
- Keep upload paths deterministic and domain-oriented
- Do not trust client-provided file metadata alone

## Payments Guidelines: Pagar.me

- Never trust payment status coming only from the frontend
- Confirm payment state through backend flows and webhooks
- Verify webhook authenticity before processing events
- Make webhook processing idempotent
- Persist provider transaction IDs, status, and event references
- Separate payment intent/creation from payment confirmation logic
- Keep an audit trail for billing-critical state transitions

## API and Domain Conventions

- Model the main domains explicitly: houses, rooms, tenants, memberships, charges, payments
- Keep DTOs and database types close to the domain terminology
- Prefer explicit status fields for workflows like listing, membership, and payment
- Avoid leaking raw database shapes directly into UI when a view model is clearer
- Use server-side filtering and pagination for list endpoints that can grow

## Security Rules

- No secrets in source code, frontend files, or committed examples with real values
- Use `.dev.vars` and Wrangler bindings for local Worker secrets
- Keep `.dev.vars.example` updated with non-sensitive placeholders only
- Sanitize and validate all external input
- Apply authorization checks in backend code even if the frontend hides actions

## Performance and Reliability

- Prefer simple queries and predictable payload sizes
- Avoid N+1 style data loading patterns
- Minimize unnecessary client-side state duplication
- Keep bundle size in mind before adding frontend dependencies
- Design critical flows to fail clearly and recover safely

## Testing Expectations

- Add tests for non-trivial business rules
- Prioritize tests for payment logic, permissions, and data transformations
- Prefer focused unit tests over heavy test setups
- Manually verify admin-critical flows when changing UI or billing behavior

## Commands

Workspace:

- Install: `pnpm install`
- Build all: `pnpm build`
- Dev web: `pnpm dev:web`
- Dev api: `pnpm dev:api`

Frontend:

- Dev: `pnpm --dir apps/web start`
- Build: `pnpm --dir apps/web build`
- Test: `pnpm --dir apps/web test`

API:

- Dev: `pnpm --dir apps/api dev`
- Build check: `pnpm --dir apps/api build`
- Deploy: `pnpm --dir apps/api deploy`

## Notes for Agents

- Respect the current monorepo split: web in `apps/web`, API in `apps/api`
- Keep changes local to the relevant app whenever possible
- If a feature touches auth, permissions, or payments, review frontend, Worker, and Supabase implications together
- If adding a new pattern, prefer the simplest one already consistent with the repository
