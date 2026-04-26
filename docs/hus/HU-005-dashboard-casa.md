# HU-005 - Acompanhar dashboard da casa

## Meta

Como admin da casa, quero ver um resumo operacional da casa, para acompanhar moradores, candidaturas e situacao financeira.

## Status

- Status: `done`
- Prioridade: `P0`
- Origem: `produto`

## Escopo

- Exibir totais de moradores, candidaturas e pagamentos
- Exibir lista de moradores
- Exibir cobrancas e pagamentos recentes

Fora de escopo:

- Relatorios exportaveis
- Graficos avancados
- Multi-casa para o mesmo admin

## Criterios de aceite

- Dado que a casa exista, quando o admin abrir `/dashboard`, entao deve ver os principais indicadores operacionais
- Dado que existam moradores, quando a tela carregar, entao a lista deve mostrar membros e papel atual
- Dado que existam cobrancas e pagamentos, quando o dashboard carregar, entao os dados financeiros resumidos devem aparecer na tela

## Casos de teste

- Validar contadores principais
- Validar lista de moradores
- Validar exibicao de cobrancas e pagamentos
- Validar leitura e empilhamento do dashboard em mobile

## Impacto tecnico

- Telas afetadas: `dashboard`
- Endpoints afetados: `GET /houses/:id`
- Entidades: `house_members`, `applications`, `monthly_charges`, `payments`

## Dependencias

- HU-004

## Observacoes

- O dashboard atual depende do detalhe consolidado da casa
