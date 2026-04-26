# HU-002 - Ver detalhes e disponibilidade de uma casa

## Meta

Como visitante, quero abrir uma casa e ver detalhes, quartos e disponibilidade, para decidir se vale me candidatar.

## Status

- Status: `done`
- Prioridade: `P0`
- Origem: `produto`

## Escopo

- Exibir informacoes completas da casa
- Exibir amenities, endereco, quartos e disponibilidade
- Permitir selecionar uma vaga disponivel

Fora de escopo:

- Galeria com multiplas imagens
- Mapa integrado
- Comparacao entre casas

## Criterios de aceite

- Dado que a casa existe, quando o visitante abrir `/houses/:id`, entao deve ver titulo, descricao, localizacao e menor preco
- Dado que a casa possui quartos, quando a tela carregar, entao cada quarto deve mostrar titulo, preco e disponibilidade
- Dado que um quarto estiver indisponivel, quando o visitante visualizar a lista, entao a opcao deve aparecer bloqueada para selecao

## Casos de teste

- Abrir uma casa valida e conferir dados completos
- Validar selecao de um quarto disponivel
- Validar quarto indisponivel como bloqueado
- Validar comportamento responsivo do detalhe em iPhone e iPad

## Impacto tecnico

- Telas afetadas: `house-detail`
- Endpoints afetados: `GET /houses/:id`
- Entidades: `houses`, `rooms`, `monthly_charges`, `payments`

## Dependencias

- HU-001

## Observacoes

- O detalhe da casa tambem prepara contexto para candidatura e leitura financeira basica
