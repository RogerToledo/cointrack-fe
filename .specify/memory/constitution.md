# CoinTrack Frontend Constitution

## Visão Geral

CoinTrack é uma aplicação de controle financeiro pessoal e familiar. O frontend é construído com Next.js (Pages Router) e se comunica com uma API REST backend via Axios. Suporta autenticação JWT, múltiplas famílias, e gerenciamento de compras, despesas, ganhos, cartões de crédito e faturas.

## Core Principles

### I. Preservar Contratos com o Backend
Nunca alterar a camada de serviços (`src/services/`) sem confirmação explícita de que o backend mudou. As interfaces TypeScript nos services representam o contrato exato da API. O formato padrão de resposta é `{ statusCode: number, message: T }`.

### II. Componentes Autocontidos
Cada entidade (creditCard, purchase, earning, etc.) tem sua pasta em `src/components/` com o componente de listagem e o modal de CRUD. A lógica de estado e chamadas à API fica no próprio componente — não há gerenciamento de estado global além de Auth e Family.

### III. Design System Consistente
O projeto usa Tailwind CSS v4 com variáveis CSS customizadas definidas em `src/styles/globals.css`. Todas as cores usam tokens semânticos: `primary`, `accent`, `success`, `danger`, `warning`, `muted`, `border`, `card`, `foreground`, `background`. Componentes usam `rounded-xl`/`rounded-2xl`, ícones do `lucide-react`, e transições suaves.

### IV. Navegação via Sidebar
A estrutura de layout usa sidebar colapsável (`src/components/NavBar.tsx`) com `src/components/Layout.tsx` gerenciando o offset do conteúdo. Páginas públicas (login, register, forgot-password) não renderizam a sidebar.

### V. Proteção de Rotas
Páginas autenticadas usam o componente `ProtectedRoute` que redireciona para `/login` se não autenticado. O token JWT é armazenado em `localStorage` e adicionado via interceptor Axios.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (Pages Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| Ícones | lucide-react |
| HTTP | Axios com interceptors (JWT + 401 redirect) |
| Gráficos | Chart.js + react-chartjs-2 |
| Linguagem | TypeScript 5 |
| Linting | ESLint 9 + eslint-config-next |
| Build | `npm run build` (next build) |

## Estrutura do Projeto

```
src/
├── components/       # Componentes organizados por entidade
│   ├── creditCard/   # CreditCard.tsx + ModalCreditCard.tsx
│   ├── purchase/     # Purchase.tsx + ModalPurchase.tsx
│   ├── invoice/      # Invoice.tsx
│   ├── earning/      # Earning.tsx + ModalEarning.tsx
│   ├── deduction/    # Deduction.tsx + ModalDeduction.tsx
│   ├── expense/      # Expense.tsx + ModalExpense.tsx + ModalPayExpense.tsx
│   ├── family/       # Family.tsx + ModalFamily.tsx + ModalInviteMember.tsx
│   ├── installment/  # ModalInstallment.tsx
│   ├── paymentType/  # PaymentType.tsx + ModalPaymentType.tsx
│   ├── person/       # Person.tsx + ModalPerson.tsx
│   ├── purchaseType/ # PurchaseType.tsx + ModalPurchaseType.tsx
│   ├── Dashboard.tsx
│   ├── Layout.tsx
│   ├── NavBar.tsx
│   └── ProtectedRoute.tsx
├── contexts/         # AuthContext + FamilyContext
├── pages/            # Next.js pages (1 por rota)
├── services/         # Camada de API (1 arquivo por entidade)
├── styles/           # globals.css com design tokens
└── types/            # Tipos compartilhados (ApiError)
```

## Padrões de Código

### Services
- Um arquivo por entidade em `src/services/`
- Exporta interfaces TypeScript representando request/response da API
- Exporta funções async que retornam `response.data`
- Usa instância Axios compartilhada de `./config`
- API base URL via `NEXT_PUBLIC_API_URL` (default: `http://127.0.0.1:8180`)
- Prefixo de rotas: `/v1/`

### Componentes de Listagem
- Header com título, descrição e botão "Novo"
- Alertas de erro/sucesso com ícones lucide
- Empty state com ícone e mensagem
- Tabela com `hover:bg-secondary/30`, `divide-y divide-border`
- Ações em cada linha: Eye (ver), Pencil (editar), Trash2 (deletar)
- Confirmação via `window.confirm()` antes de deletar

### Modais
- Overlay com `bg-black/50 backdrop-blur-sm`
- Container com `rounded-2xl`, header com título + botão fechar (X)
- Formulário com inputs `rounded-xl`, labels com `text-sm font-medium`
- Alertas inline de sucesso/erro
- Fecha automaticamente após ação bem-sucedida (setTimeout 2-3s)

### Páginas de Autenticação
- Layout split-screen (branding à esquerda, form à direita)
- Inputs com ícone à esquerda (`pl-11`)
- Botão primário com spinner de loading

## API - Formato Padrão

```typescript
// Resposta de lista
{ statusCode: number, message: T[] }

// Resposta de item único
{ statusCode: number, message: T }

// Erro
{ statusCode: number, message: string }
```

## Contextos

### AuthContext
- `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `updateUser()`
- Token em `localStorage('token')`, user em `localStorage('user')`
- JWT decodificado no client para extrair dados do usuário

### FamilyContext
- `families`, `selectedFamily`, `setSelectedFamily()`, `refreshFamilies()`
- Família selecionada determina as pessoas disponíveis nos formulários

## Regras de Negócio no Frontend

1. **Cartão de Crédito**: Tipo F (Físico) recebe `card_name = "Físico"` automaticamente. Tipo VT recebe `card_name = "Temporário"`. Tipo V permite nome livre. Tipos V e VT exigem `physical_card_id` (cartão pai).
2. **Fatura**: Exibe compras por mês/cartão. Status: Aberta (mês atual/futuro), Fechada (mês passado, não paga), Paga (todas compras pagas).
3. **Despesas**: Suportam recriação de recorrentes e pagamento individual.
4. **Compras parceladas**: Parcelas são gerenciadas via modal separado com pagamento individual.

## Governance

- A constitution deve ser atualizada sempre que novas entidades, padrões ou regras de negócio forem adicionados
- Alterações em services exigem confirmação do contrato backend
- O build (`npm run build`) deve passar sem erros antes de qualquer merge
- Não adicionar dependências sem justificativa clara

**Version**: 1.0.0 | **Ratified**: 2026-07-21 | **Last Amended**: 2026-07-21
