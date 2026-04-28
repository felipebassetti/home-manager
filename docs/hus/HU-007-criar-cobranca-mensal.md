# HU-007 - Lancar cobranca mensal para a casa

## Meta

Como admin da casa, quero criar cobrancas mensais, para registrar valores devidos pelos moradores.

## Status

- Status: `done`
- Prioridade: `P1`
- Origem: `produto`

## Escopo

- Criar cobranca com titulo, valor e vencimento
- Associar cobranca a uma casa
- Exibir nova cobranca no dashboard e detalhe da casa

Fora de escopo:

- Rateio automatico por morador
- Recorrencia automatica
- Emissao fiscal

## Criterios de aceite

- Dado que o admin esteja autenticado no contexto da casa, quando preencher titulo, valor e vencimento, entao a cobranca deve ser criada
- Dado que a cobranca foi criada, quando o dashboard e o detalhe forem recarregados, entao o novo item deve aparecer
- Dado que o formulario tenha dados invalidos, quando o admin tentar salvar, entao o sistema deve bloquear o envio e mostrar erro claro

## Casos de teste

- Criar cobranca valida
- Tentar criar cobranca sem valor ou vencimento
- Validar visualizacao da cobranca em mobile

## Impacto tecnico

- Telas afetadas: `dashboard`, `house-detail`, nova tela ou secao de cobrancas
- Endpoints afetados: `POST /charges`
- Entidades: `monthly_charges`

## Dependencias

- HU-004
- HU-005

## Observacoes

- Fluxo de UI implementado no detalhe da casa com validacao local e feedback de erro
- API `POST /charges` agora rejeita payload invalido com `400`
