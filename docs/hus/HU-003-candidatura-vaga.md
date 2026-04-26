# HU-003 - Enviar candidatura para uma vaga

## Meta

Como visitante, quero enviar uma candidatura para uma vaga com mensagem ao admin, para demonstrar interesse em entrar na casa.

## Status

- Status: `done`
- Prioridade: `P0`
- Origem: `produto`

## Escopo

- Selecionar vaga disponivel
- Informar mensagem ao admin
- Criar candidatura com status inicial `pending`

Fora de escopo:

- Upload de documentos
- Chat em tempo real
- Fluxo de aprovacao automatica

## Criterios de aceite

- Dado que o visitante esteja no detalhe da casa, quando selecionar uma vaga disponivel e enviar mensagem, entao a candidatura deve ser criada
- Dado que a candidatura foi criada, quando o fluxo finalizar, entao o usuario deve receber feedback de sucesso
- Dado que a vaga nao esteja disponivel, quando tentar selecionar, entao ela nao deve aceitar envio

## Casos de teste

- Enviar candidatura com quarto selecionado
- Enviar candidatura sem quebrar o fluxo quando o backend estiver em mock
- Validar feedback visual apos envio
- Validar formulario em mobile com textarea e CTA acessiveis

## Impacto tecnico

- Telas afetadas: `house-detail`
- Endpoints afetados: `POST /applications`
- Entidades: `applications`

## Dependencias

- HU-002

## Observacoes

- O status inicial esperado da candidatura e `pending`
