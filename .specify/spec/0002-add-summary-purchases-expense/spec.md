# 📋 SPEC: Dashboard — Resumo Financeiro Mensal

## 1. Objetivo
Exibir uma visão consolidada dos compromissos financeiros mensais da família (ou de um membro específico), integrando:
1. Resumo agrupado dos 4 grandes blocos de despesas com navegação rápida (*Deep Linking*) mantendo a identidade visual da aplicação.
2. Indicadores consolidados de **Total de Ganhos**, **Total de Despesas do Mês** e **Saldo Disponível**.
3. **Gráfico de Ganhos vs. Despesas Totais** (uso do orçamento e taxa de economia/disponibilidade).
4. **Gráfico e distribuição por Tipos de Compra** que mais consom recursos no período.

---

## 2. Arquitetura de Interface (UI/UX)

### 2.1. Cabeçalho e Filtros (Top Bar)
* **Título & Subtítulo:**
  * Título: `Dashboard`
  * Subtítulo: `Resumo financeiro mensal consolidado`
* **Controles de Filtro:**
  * **Seletor de Membro (Família):** Dropdown (`<select>`) populado a partir dos membros da família (reaproveitando a lógica do `FamilyContext` / `getPerson`).
    * *Valor padrão:* `Todos` (`person_id = ""` ou `"all"`).
    * *Comportamento:* Ao alterar, dispara nova requisição filtrando totais apenas daquela pessoa.
  * **Seletor de Competência:** Reutilizar o componente `< novembro de 2026 >` alinhado à direita.

### 2.2. Cards de Indicadores (KPIs)
Cards no topo exibindo visão geral executiva do mês:
1. **Total de Ganhos:** Soma total das receitas e salários do mês vigente (`TotalIncome`).
2. **Total do Mês (Gastos):** Soma consolidada dos 4 grupos da tabela (`Compras + Despesas + Investimentos + Faturas`).
3. **Saldo Disponível:** Diferença entre Ganhos e Gastos, com badge informando a porcentagem livre do orçamento (`AvailablePercentage`).
4. **Parcelamentos:** Total em aberto e quantidade de parcelas ativas no período.

### 2.3. Tabela de Resumo Agrupado (Deep Linking)
Estrutura visual da tabela de compras com bordas sutis e linhas alternadas.

* **Colunas:**
  1. `DESCRIÇÃO`
  2. `VALOR`
  3. `DATA`
  4. `AÇÕES` (alinhada à direita)

* **Regras de Exibição por Coluna:**
  * **DESCRIÇÃO:** Nome fixo do agrupamento (`Compras`, `Despesas`, `Investimentos`, `Fatura`) + Badge com a contagem de itens (ex: `8 itens`).
  * **VALOR:** Formatado em BRL (`R$ 0.000,00`).
  * **DATA:** Exibir a competência formatada no padrão `Mmm/AAAA` (ex: `Nov/2026`) para todos os grupos, incluindo **Fatura**.
  * **AÇÕES:** Botão **Visualizar** (`<Eye size={18} />` da `lucide-react`) com redirecionamento via Deep Linking.

### 2.4. Seção Visual: Gráficos e Distribuição
1. **Gráfico de Ganhos vs. Despesas (Uso do Orçamento):**
   * Gráfico Doughnut exibindo visualmente a proporção de despesas totais utilizadas vs. saldo disponível, com indicador central percentual.
2. **Tipos de Compras que Mais Gastam (Categorias):**
   * Lista ordenada das categorias de compras com maior consumo de recursos, com barras de progresso proporcionais, valores formatados em BRL e porcentagem de representatividade no total de compras.

---

## 3. Regras de Negócio e Fluxo de Dados

### 3.1. Regras de Agrupamento e Cálculo (Backend)
Para cada categoria, o backend filtra pelo `month`, `year` e `person_id` (quando diferente de `Todos`):

1. **Compras (`PURCHASE`):** Soma das compras onde `credit_card_id` é nulo/vazio (compras sem cartão).
2. **Despesas (`EXPENSE`):** Soma das despesas do mês vigente.
3. **Investimentos (`INVESTMENT`):** Soma dos investimentos/aportes do mês vigente.
4. **Fatura (`INVOICE`):** Soma consolidada de todos os cartões cadastrados no mês vigente (parcelas do mês + compras à vista no ciclo de fechamento).
5. **Ganhos (`OVERVIEW.TOTAL_INCOME`):** Soma de todos os rendimentos líquidos recebidos no mês.
6. **Tipos de Compras (`CATEGORIES_BREAKDOWN`):** Agrupamento por categoria (`PurchaseType`) com soma de valores e cálculo de porcentagem sobre o total.

> **Fórmula de Cálculo do Valor de Despesa:**
> $$\text{Valor Final} = (\text{Valor Pago} \neq \text{null} \land \text{Valor Pago} > 0) \ ? \ \text{Valor Pago} : \text{Valor Estimado}$$

### 3.2. Contrato da API (`GET /v1/dashboard/summary`)
* **Query Params:** `?month=11&year=2026&person_id=<uuid_opcional>`
* **Response Esperado (`200 OK`):**

```json
{
  "statusCode": 200,
  "message": {
    "total_month": 6450.90,
    "competence": "Nov/2026",
    "overview": {
      "total_income": 10000.00,
      "total_expenses": 6450.90,
      "available_balance": 3549.10,
      "available_percentage": 35.49
    },
    "items": [
      {
        "type": "PURCHASE",
        "description": "Compras",
        "total_amount": 1200.00,
        "items_count": 4,
        "competence": "Nov/2026"
      },
      {
        "type": "EXPENSE",
        "description": "Despesas",
        "total_amount": 2100.45,
        "items_count": 9,
        "competence": "Nov/2026"
      },
      {
        "type": "INVESTMENT",
        "description": "Investimentos",
        "total_amount": 1000.00,
        "items_count": 2,
        "competence": "Nov/2026"
      },
      {
        "type": "INVOICE",
        "description": "Fatura",
        "total_amount": 2150.45,
        "items_count": 14,
        "competence": "Nov/2026"
      }
    ],
    "categories_breakdown": [
      {
        "category": "Alimentação",
        "amount": 800.00,
        "percentage": 50.00
      },
      {
        "category": "Transporte",
        "amount": 400.00,
        "percentage": 25.00
      }
    ]
  }
}
```

---

## 4. Navegação e Deep Linking (Frontend)

Ao clicar no ícone `<Eye />` ou na linha, redireciona via `router.push()` preservando o contexto:

| Grupo (`type`) | Rota de Destino | Exemplo de URL Gerada |
| :--- | :--- | :--- |
| `PURCHASE` | `/purchase` | `/purchase?month=11&year=2026` |
| `EXPENSE` | `/expense` | `/expense?month=11&year=2026` |
| `INVESTMENT` | `/investment` | `/investment?month=11&year=2026` |
| `INVOICE` | `/invoice` | `/invoice?month=11&year=2026` |

---

## 5. Critérios de Aceite (Checklist)
- [ ] A tela inicia carregando o mês/ano atual e o filtro de pessoa em `Todos`.
- [ ] O card `Total do mês` reflete a soma consolidada das 4 linhas da tabela.
- [ ] Exibe os cards de `Total de Ganhos` e `Saldo Disponível` com porcentagem livre.
- [ ] Gráfico de Ganhos vs. Despesas (Doughnut) exibe a proporção usada do orçamento.
- [ ] Lista/Gráfico de Tipos de Compras apresenta os gastos agrupados por categoria com valor e barra percentual.
- [ ] Ao trocar o mês no seletor ou alterar a pessoa, todos os indicadores e gráficos são atualizados suavemente.
- [ ] Deep Linking para as rotas filhas preserva a competência selecionada.
