# HU-004 - Cadastrar casa e vagas iniciais

## Meta

Como admin da casa, quero cadastrar uma nova casa com quartos iniciais, para publicar a oferta e iniciar a operacao.

## Status

- Status: `done`
- Prioridade: `P0`
- Origem: `produto`

## Escopo

- Criar casa com dados principais
- Cadastrar amenidades
- Cadastrar um ou mais quartos iniciais
- Tornar o criador admin da casa automaticamente

Fora de escopo:

- Upload real de imagem
- Edicao posterior da casa
- Moderacao de anuncio

## Criterios de aceite

- Dado que o admin preencha os dados obrigatorios, quando enviar o formulario em `/house-manage`, entao a casa deve ser criada
- Dado que a casa foi criada, quando o fluxo concluir, entao ela deve aparecer na listagem do marketplace
- Dado que o cadastro inclua quartos, quando a casa for salva, entao os quartos devem aparecer no detalhe da casa
- Dado que o admin criou a casa, quando a persistencia concluir, entao ele deve ser vinculado como membro com role `admin`

## Casos de teste

- Criar casa com um quarto
- Criar casa com varios quartos
- Validar preview e feedback de sucesso
- Validar usabilidade do formulario em mobile e tablet

## Impacto tecnico

- Telas afetadas: `house-manage`, `houses`, `house-detail`
- Endpoints afetados: `POST /houses`
- Entidades: `houses`, `rooms`, `house_members`

## Dependencias

- Dados minimos de perfil admin

## Observacoes

- Este card cobre o bootstrap operacional da casa no MVP
