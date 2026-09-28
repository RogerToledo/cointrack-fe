# Spec: Refatora earning e deductiom para atender as mudanças do backend

## Context & Motivation
Foi feito um refact no Back para melhor melhorar a experiência do cliente, dessa forma, foram feitas mudanças estruturais em **earning** e **deduction** 

---

## Functional Requirements (FRs)

- **FR-001 (Earning)**: DEVE fazer a request com filtro para `GET v1/earnings?year=XXXX&month=X&idUser=uuid` e usar o response para exibir as informações da tela de ganhos.
- **FR-002 (Deduction )**: DEVE fazer a request com filtro para `GET v1/deductions?year=XXXX&month=X&idUser=uuid` e usar o response para exibir as informações da tela de deduções.
- **FR-003 (Earning Update)**: Ao fazer um FindByID `GET /v1/earnings/uuid`, DEVESSE ler o response e e preencher o modal que existe hoje.
- **FR-004 (Deduction Update)**: Ao fazer um FindByID `GET /v1/deductions/uuid`, DEVESSE ler o response e e preencher o modal que existe hoje.

---

## API Contracts

> As respostas reais divergem das amostras originais desta spec em dois pontos:
> `periodicity` retorna em **PT-BR** (`MENSAL`, `SEMESTRAL`, `ANUAL`) e não em inglês,
> e a listagem de deduções expõe `id_earning` em snake_case. Ver
> [Contrato de escrita](#contrato-de-escrita) para os bodies de create/update.

### 1. Create Earning (`GET v1/earnings?year=XXXX&month=X&idUser=uuid`)

**Response Body:**

```json
{
    "id": "019f57c2-f70c-73e0-90fe-37eb1164b90d",
    "description": "Salário - R2TO",
    "idUser": "019f5742-a988-76f9-ad8b-cddd2c89236d",
    "periodicity": "MONTHLY",
        "record": {
        "id": "45380657-2322-486b-9e4f-f7b6a8af7bfc",
        "id_earning": "019f57c2-f70c-73e0-90fe-37eb1164b90d",
        "date": "2026-07-05T00:00:00Z",
        "amount": 10000
    }
}
```

### 2. Create Deduction (`GET v1/deductions?year=XXXX&month=X&idUser=uuid`)
**Response Body:**

```json
{
    "id": "019f57bf-c73b-7e53-bd19-29714cc72a35",
    "description": "INSS",
    "periodicity": "MONTHLY",
    "active": true,
    "id_earning": "019f57bd-e635-7aba-8356-4b1baca0a1ad",
    "record": {
        "id": "95e6cab2-6c03-4393-9830-011e9f5e73d4",
        "id_deduction": "019f57bf-c73b-7e53-bd19-29714cc72a35",
        "date": "2026-07-05T00:00:00Z",
        "amount": 2000
    }
}
```
---

## Contrato de escrita

> Seção descoberta em produção durante a implementação. A spec original documentava
> apenas as respostas, e essa lacuna gerou quatro 500 (`uuid` vazio no update de
> earning, `date` vazia no create, `uuid` vazio no create de dedução e `id_earning`
> obrigatório no update) porque o frontend assumiu que create/update mantinham o
> formato antigo (`active`, `is_monthly`, `person_id`, `fixed`, `earning_id`).

### Create Earning — `POST /v1/earnings`

```json
{
    "description": "Salário",
    "idUser": "019f5742-a988-76f9-ad8b-cddd2c89236d",
    "periodicity": "MENSAL",
    "record": {
        "date": "2026-09-15",
        "amount": 7500
    }
}
```

### Update Earning — `PUT /v1/earnings`

Mesmo body, acrescido de `id` no nível raiz.

### Create Deduction — `POST /v1/deductions`

```json
{
    "idEarning": "019f57bd-e635-7aba-8356-4b1baca0a1ad",
    "description": "INSS",
    "periodicity": "MENSAL",
    "record": {
        "date": "2026-09-15",
        "amount": 1250
    }
}
```

### Update Deduction — `PUT /v1/deductions`

Mesmo body, acrescido de `id` no nível raiz. **Atenção:** o PUT exige `id_earning`
(snake_case) enquanto o POST exige `idEarning` (camelCase). A tradução fica
centralizada em `updateDeduction` para que o modal não precise conhecer a
inconsistência.

### Regras transversais

- **Valores de `periodicity` são PT-BR**: `MENSAL`, `SEMESTRAL`, `ANUAL`. Não enviar
  os valores em inglês.
- **`record` é obrigatório e aninhado** em todo write. `date` não pode ser string
  vazia — o Postgres rejeita com `invalid input syntax for type date: ""`.
- **Campos UUID não podem ser string vazia** — o mesmo erro ocorre com
  `invalid input syntax for type uuid: ""`.
- **`idUser` no create de earning**: o backend infere o proprietário pelo token JWT.
  O campo é enviado, mas não é a fonte da verdade do vínculo.
- **O backend não valida a FK de `id_earning` no insert.** É possível criar uma
  dedução apontando para um ganho inexistente, e a coluna "Ganho" da listagem
  exibe `-` sem sinalizar erro. Por isso o select de ganhos do modal DEVE ser
  filtrado por `year`/`month` do contexto atual.
- **Erros de validação retornam 400** com o campo citado
  (`Validação falhou: id_earning: campo obrigatório`). Já falhas de repositório
  retornam 500 genérico (`Ocorreu um erro interno no servidor.`) — nesses casos
  só o log do backend revela a causa.

---

## Feedback de Testes (Ajustes)

- [x] **Ajuste 1:** No Modal Cadastro de Ganhos, DEVESSE remover Ativo e Mensal e DEVE adicionar um SELECT com os valores `Mensal, Anual, Semestral`
- [x] **Ajuste 2:** No Modal Cadastro de Deduções, DEVESSE remover Ativo.
- [x] **Ajuste 3:** Na tela de dedução, DEVESSE remover a coluna Ativo
- [x] **Ajuste 4:** Na tela de dedução de ganhos a primeira coluna DEVE ser o usuário