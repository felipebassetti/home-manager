# HU-006 - Atualizar status manual de pagamentos

## Meta

Como admin da casa, quero marcar pagamentos como pagos, pendentes ou atrasados, para acompanhar manualmente a adimplencia no MVP.

## Status

- Status: `done`
- Prioridade: `P0`
- Origem: `produto`

## Escopo

- Listar pagamentos existentes
- Permitir alterar status para `paid`, `pending` e `overdue`
- Refletir o status atualizado no fluxo

Fora de escopo:

- Pix automatico
- Conciliacao bancaria
- Regras avancadas de multa e juros

## Criterios de aceite

- Dado que existam pagamentos cadastrados, quando o admin abrir `/payments`, entao deve ver a lista com morador, cobranca, valor e status
- Dado que o admin alterar o status de um pagamento, quando clicar na acao correspondente, entao o registro deve ser atualizado
- Dado que um pagamento esteja atrasado, quando a tela renderizar, entao o status deve ficar visivel de forma clara

## Casos de teste

- Alterar um pagamento para `paid`
- Alterar um pagamento para `pending`
- Alterar um pagamento para `overdue`
- Validar acessibilidade dos botoes e uso confortavel em mobile

## Impacto tecnico

- Telas afetadas: `payments`, `dashboard`, `house-detail`
- Endpoints afetados: `GET /payments`, `POST /payments`
- Entidades: `payments`

## Dependencias

- HU-005

## Observacoes

- O status de pagamento no MVP ainda e manual e nao depende do Pagar.me
