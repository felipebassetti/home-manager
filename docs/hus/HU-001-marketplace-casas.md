# HU-001 - Explorar marketplace de casas

## Meta

Como visitante, quero ver a lista de casas compartilhadas disponiveis, para encontrar opcoes alinhadas ao meu perfil.

## Status

- Status: `done`
- Prioridade: `P0`
- Origem: `produto`

## Escopo

- Exibir listagem de casas no marketplace
- Mostrar informacoes basicas da casa no card
- Permitir navegar da home para a listagem

Fora de escopo:

- Ordenacao avancada
- Favoritos
- Recomendacao personalizada

## Criterios de aceite

- Dado que existem casas cadastradas, quando o visitante abrir `/houses`, entao a listagem deve exibir cards com titulo, localizacao e preco inicial
- Dado que o visitante estiver na home, quando clicar em `Explorar casas`, entao deve navegar para `/houses`
- Dado que nao existam resultados para o filtro atual, quando a listagem carregar, entao deve exibir estado vazio claro

## Casos de teste

- Abrir `/houses` e validar exibicao de cards
- Abrir a home e navegar para a listagem pelo CTA principal
- Simular filtros sem resultado e validar estado vazio
- Validar uso em mobile com cards legiveis e CTA acessivel

## Impacto tecnico

- Telas afetadas: `home`, `houses`
- Componentes: `house-card`, `filters`
- Endpoints afetados: `GET /houses`
- Entidades: `houses`, `rooms`

## Dependencias

- Dados de casas disponiveis no mock ou Supabase

## Observacoes

- Esta HU sustenta o fluxo principal de aquisicao do produto
