# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

## [1.2.0] - 2026-09-27

Branch de integração `v1.2.0`, comparada a `main`.

### Adicionado

#### Spec-kit (PR #11)

- Estrutura `.specify/` com spec `0001-refact-earning-deduction`, memória do projeto, templates, scripts bash e workflows.
- Integração do opencode com 10 comandos speckit em `apps/web/cointrack/.opencode/commands/`: `analyze`, `checklist`, `clarify`, `constitution`, `converge`, `implement`, `plan`, `specify`, `tasks`, `taskstoissues`.
- `AGENTS.md` na raiz com a constituição do projeto: arquitetura do monorepo, convenções de código, camada de serviço, regras de dual write e comandos essenciais.
- Princípios de referência em `.specify/memory/`: `react-clean-code.md` e `minimal-diff.md`.
- Filtro `idUser` nas listagens de `GET /v1/earnings` e `GET /v1/deductions`.
- Coluna **Data** nas telas de Ganhos e Deduções.
- Coluna **Usuário** como primeira coluna da tela de Ganhos, com o nome do usuário logado via `AuthContext`.
- Campo **Periodicidade** no tipo `Earning` e no tipo `Deduction`, substituindo os campos booleanos antigos.

#### Spec 0001 (PR #12)

- Campo `record` aninhado nos tipos `Earning` e `Deduction`, espelhando o novo contrato do backend.
- `EarningRecord` e `DeductionRecord` como tipos dos payloads aninhados.
- SELECT de periodicidade no modal de Ganhos, com valores em PT-BR para evitar conversão no backend: `MENSAL`, `SEMESTRAL`, `ANUAL`.
- Filtro de periodicidade no modal de Dedução, com o valor `FIXO`.

### Alterado

#### Spec-kit (PR #11)

- Constituição do projeto evoluída de v1.0 para v2.0: passou a cobrir a interface mobile (Expo/React Native), a estrutura do monorepo, os hooks mobile, os params de módulo e a regra de dual write entre `apps/web/src/` e `src/`.
- `.gitignore` passou a ignorar `.config`.

#### Spec 0001 (PR #12)

- Contrato de `Earning`: `person_id` → `idUser`, `is_monthly` → `periodicity`, e `amount`/`date` passaram a vir aninhados em `record`.
- Contrato de `Deduction`: `earning_id` → `id_earning`, `fixed` → `periodicity`, e `amount`/`date` passaram a vir aninhados em `record`.
- `getEarnings` e `getDeductions` agora aceitam `idUser` como terceiro parâmetro de filtro.
- Telas de Ganhos e Deduções passaram a enviar `user?.id` do `AuthContext` como `idUser` na listagem.
- Modal de Ganhos: os modais de cadastro e visualização passaram a ser preenchidos a partir do `record` retornado pelo `GET /v1/earnings/:id`.
- Modal de Dedução: passou a ser preenchido a partir do `record` retornado pelo `GET /v1/deductions/:id`.
- Tabela de Ganhos: coluna **Valor** passou a formatar o valor com `toLocaleString('pt-BR')`.
- Todas as alterações de `apps/web/src/` foram espelhadas em `src/`, conforme a regra de dual write do projeto.

### Removido

#### Spec 0001 (PR #12)

- Checkboxes **Ativo** e **Mensal** do modal de Ganhos, substituídos pelo SELECT de periodicidade.
- Checkbox **Ativo** do modal de Dedução, permanecendo apenas o campo **Fixo**.
- Coluna **Ativo** da tela de Deduções.
- Coluna **Ganho Líquido** da tela de Ganhos, deixou de ser calculada no frontend.
- Campo `person_id` do corpo da requisição de `PUT /v1/earnings`. O backend resolve o owner pelo ID do earning, e o envio de valor vazio quebrava a query.

### Corrigido

#### Spec 0001 (PR #12)

- Erro `pq: invalid input syntax for type uuid: ""` ao atualizar um ganho. O campo `person_id` era enviado vazio quando o usuário logado não era mapeado na lista de proprietários, e o backend falhava ao tentar interpretá-lo como UUID.

## [1.1.0]

Branch de release `v1.1.0`.

## [1.0.0]

Release inicial.

[Não publicado]: https://github.com/RogerToledo/cointrack-fe/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/RogerToledo/cointrack-fe/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/RogerToledo/cointrack-fe/compare/1.0.0...v1.1.0
[1.0.0]: https://github.com/RogerToledo/cointrack-fe/releases/tag/1.0.0
