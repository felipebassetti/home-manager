# HU-008 - Gerenciar moradores da casa

## Meta

Como admin da casa, quero adicionar e acompanhar moradores, para manter a casa organizada.

## Status

- Status: `done`
- Prioridade: `P1`
- Origem: `produto`

## Escopo

- Adicionar morador a uma casa
- Definir role inicial
- Exibir morador na lista da casa

Fora de escopo:

- Convite por email
- Fluxo de saida de morador
- Historico completo de mudancas

## Criterios de aceite

- Dado que o admin esteja gerindo uma casa, quando adicionar um usuario valido, entao ele deve ser vinculado a casa
- Dado que o membro foi adicionado, quando o dashboard carregar, entao ele deve aparecer na lista de moradores
- Dado que a adicao falhe, quando o backend responder com erro, entao o admin deve receber feedback claro

## Casos de teste

- Adicionar um morador com sucesso
- Validar refletir no dashboard
- Validar formulario em mobile com foco em toque e legibilidade

## Impacto tecnico

- Telas afetadas: `dashboard`, `house-manage` ou nova tela de membros
- Endpoints afetados: `POST /houses/:id/members`
- Entidades: `house_members`, `profiles`

## Dependencias

- HU-004
- HU-005

## Observacoes

- Fluxo implementado no detalhe da casa com adicao por email, role inicial e feedback de erro
- Backend agora resolve perfil por email e impede membro duplicado na mesma casa
