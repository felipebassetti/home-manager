# HUs

Estas historias de usuario sao os cards que vao guiar desenvolvimento, validacao manual e futuras automacoes de teste do flatsharing.

## Como usar

- Cada card representa um recorte funcional pequeno e entregavel
- O time implementa a HU usando criterios de aceite como contrato
- A validacao manual deve seguir a secao `Casos de teste`
- Quando uma HU mudar de escopo, atualize o card antes do codigo

## Status

- `planned`: ainda nao iniciado
- `in_progress`: em desenvolvimento
- `done`: implementado e validado
- `blocked`: depende de outra entrega ou decisao

## Backlog inicial

| ID | Titulo | Persona | Status | Prioridade |
| --- | --- | --- | --- | --- |
| HU-001 | Explorar marketplace de casas | visitante | done | P0 |
| HU-002 | Ver detalhes e disponibilidade de uma casa | visitante | done | P0 |
| HU-003 | Enviar candidatura para uma vaga | visitante | done | P0 |
| HU-004 | Cadastrar casa e vagas iniciais | admin da casa | done | P0 |
| HU-005 | Acompanhar dashboard da casa | admin da casa | done | P0 |
| HU-006 | Atualizar status manual de pagamentos | admin da casa | done | P0 |
| HU-007 | Lancar cobranca mensal para a casa | admin da casa | done | P1 |
| HU-008 | Gerenciar moradores da casa | admin da casa | done | P1 |
| HU-009 | Entrar com autenticacao real do Supabase | admin e morador | blocked | P1 |

## Convencao de arquivos

- `HU-001-nome-curto.md`
- Use o template em [`_template.md`](C:/Users/Admin/Documents/Github/home-manager/docs/hus/_template.md)
