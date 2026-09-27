# Spec: Refatora earning e deductiom para atender as mudanças do backend

## Context & Motivation
Foi feito um refact no Back para melhor melhorar a experiência do cliente, dessa forma, foram feitas mudanças estruturais em **earning** e **deduction** 

---

## Functional Requirements (FRs)

- **FR-001 (Earning)**: DEVE fazer a request com filtro para `GET v1/earnings?year=XXXX&month=X&idUser=uuid` e usar o response para exibir as informações da tela de ganhos.
- **FR-002 (Deduction )**: DEVE fazer a request com filtro para `GET v1/deductions?year=XXXX&month=X&idUser=uuid` e usar o response para exibir as informações da tela de deduções.
- **FR-003 (Earning Update)**: Ao fazer um FindByID `GET /v1/earnings/uuid`, DEVESSE ler o response e e preencher o modal que existe hoje.
- **FR-004 (Deduction Update)**: Ao fazer um FindByID `GET /v1/deduction/uuid`, DEVESSE ler o response e e preencher o modal que existe hoje.

---

## API Contracts

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
## Feedback de Testes (Ajustes)

- [x] **Ajuste 1:** No Modal Cadastro de Ganhos, DEVESSE remover Ativo e Mensal e DEVE adicionar um SELECT com os valores `Mensal, Anual, Semestral`
- [x] **Ajuste 2:** No Modal Cadastro de Deduções, DEVESSE remover Ativo.
- [x] **Ajuste 3:** Na tela de dedução, DEVESSE remover a coluna Ativo
- [x] **Ajuste 4:** Na tela de dedução de ganhos a primeira coluna DEVE ser o usuário