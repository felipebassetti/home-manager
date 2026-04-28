# HU-009 - Entrar com autenticacao real do Supabase

## Meta

Como admin ou morador, quero entrar com autenticacao real, para acessar dados e acoes do meu perfil com seguranca.

## Status

- Status: `blocked`
- Prioridade: `P1`
- Origem: `tech`

## Escopo

- Configurar cliente Supabase no frontend
- Permitir login por email e senha
- Encerrar sessao
- Preparar o app para trocar mock de perfil por sessao real

Fora de escopo:

- Recuperacao de senha
- Social login
- Permissoes finas por tela

## Criterios de aceite

- Dado que o projeto tenha `SUPABASE_URL` e `SUPABASE_ANON_KEY`, quando o usuario informar credenciais validas, entao o login deve acontecer
- Dado que o usuario esteja autenticado, quando navegar no app, entao o estado da sessao deve estar disponivel para os fluxos principais
- Dado que o usuario clique em sair, quando a acao for executada, entao a sessao deve ser encerrada

## Casos de teste

- Login com credenciais validas
- Falha com credenciais invalidas
- Logout
- Validar fluxo em mobile com teclado virtual e botao principal visivel

## Impacto tecnico

- Telas afetadas: login, header, fluxos protegidos
- Modulos afetados: `auth.service`, `environment`
- Entidades: `profiles`, `auth.users`

## Dependencias

- Projeto Supabase configurado
- Politicas de acesso definidas

## Observacoes

- Cliente Supabase, logout e guardas de rota foram integrados ao frontend
- Falta configurar credenciais reais (`runtime-config.js`, `.dev.vars`) e autenticar Wrangler para validar o ambiente end to end
