# CoinTrack Frontend Constitution

## Visão Geral

CoinTrack é uma aplicação de controle financeiro pessoal e familiar com duas interfaces (web e mobile) que consomem uma API REST compartilhada. O frontend web é Next.js (Pages Router), o mobile é Expo/React Native. Idioma: **PT-BR** em toda UI.

## Core Principles

### I. Preservar Contratos com o Backend
Nunca alterar a camada de serviços sem confirmação explícita de que o backend mudou. As interfaces TypeScript nos services representam o contrato exato da API. O formato padrão de resposta é `{ statusCode: number, message: T }`.

### II. Componentes Autocontidos
Cada entidade (creditCard, purchase, earning, etc.) tem sua pasta com o componente de listagem e o modal de CRUD. A lógica de estado e chamadas à API fica no próprio componente — não há gerenciamento de estado global além de Auth e Family.

### III. Design System Consistente
**Web**: Tailwind CSS v4 com variáveis CSS customizadas em `globals.css`. Tokens semânticos: `primary`, `accent`, `success`, `danger`, `warning`, `muted`, `border`, `card`, `foreground`, `background`. Bordas `rounded-xl`, ícones `lucide-react`.
**Mobile**: `StyleSheet.create()` com cores hardcoded. Expo `userInterfaceStyle: automatic` para light/dark.

### IV. Navegação
**Web**: Sidebar colapsável (`NavBar.tsx`) com `Layout.tsx` gerenciando offset. Páginas públicas não renderizam sidebar.
**Mobile**: Tab navigator (Dashboard + Compras) via expo-router. Rotas file-based.

### V. Proteção de Rotas
**Web**: Componente `ProtectedRoute` redireciona para `/login`. Token JWT em `localStorage`.
**Mobile**: `AuthProvider` controla navegação via `Stack` condicional. Token em `expo-secure-store`.

### VI. Dual Write (web/legado)
Toda alteração em `apps/web/src/` **DEVE** ser copiada para `src/` na raiz. O Vercel builda a partir da raiz usando o `tsconfig.json` que mapeia `@/*` para `./src/*`.

## Stack Tecnológica

| Camada | Web | Mobile |
|--------|-----|--------|
| Framework | Next.js 16 (Pages Router) | Expo SDK 57 |
| React | 19 | 19.2 |
| Linguagem | TypeScript 5 (strict) | TypeScript 6 (strict) |
| Estilo | Tailwind 4 + CSS vars | StyleSheet.create() |
| UI | Flowbite 3 + Lucide React | Componentes nativos |
| HTTP | Axios | Axios |
| Gráficos | Chart.js 4 + react-chartjs-2 | — |
| State | React Context API | React Context API |
| Segurança | localStorage (token) | expo-secure-store |
| Bundler | Turbopack | Metro |

## Monorepo

```
cointrack-fe/
  apps/
    web/        @cointrack/web
    mobile/     @cointrack/mobile
  packages/
    services/   @cointrack/services  API client factory (plataforma-agnóstico)
    types/      @cointrack/types     Interfaces compartilhadas
    utils/      @cointrack/utils     Utilitários (formatBRL)
  src/          ← LEGADO (espelho de apps/web/src/)
```

## Estrutura do Projeto

### Web (`apps/web/src/`)
```
src/
├── components/       # Componentes por entidade
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

### Mobile (`apps/mobile/`)
```
app/
  _layout.tsx              Root: GestureHandler > SafeArea > Auth > Toast > Family
  (auth)/                  login.tsx, register.tsx, forgot-password.tsx
  (tabs)/
    _layout.tsx            Tab navigator (Dashboard, Compras)
    index.tsx              Dashboard
    purchases/             index.tsx, form.tsx
components/                ConfirmDialog, EmptyState, ErrorState, FamilySelector,
                           FormInput, LoadingScreen, MonthNavigator, MonthPicker,
                           PullToRefreshList, SwipeableRow, Toast
contexts/                  AuthContext, FamilyContext, ToastContext
hooks/                     useCRUD<T>, useDashboard, useMonthNavigation, usePurchases, etc.
services/                  api.ts (usa @cointrack/services factory)
```

## Padrões de Código

### Services
- **Legado (web)**: Um arquivo por entidade, funções standalone, instância Axios de `config.tsx`
- **Novo (packages/services)**: Factory functions `createXService(client)` — plataforma-agnóstico
- API base URL via env: web `NEXT_PUBLIC_API_URL`, mobile `EXPO_PUBLIC_API_URL` (default: `http://127.0.0.1:8180`)
- Prefixo de rotas: `/v1/`

### Componentes de Listagem (web)
- Header com título, descrição e botão "Novo"
- Seletor de mês com `<input type="month">` e setas (ChevronLeft/ChevronRight)
- Paginação com `page`, `totalPages`, `total`
- Tabela com `hover:bg-secondary/30`, `divide-y divide-border`
- Ações: Eye (ver), Pencil (editar), Trash2 (deletar)
- Confirmação via `window.confirm()` antes de deletar

### Modais (web)
- Overlay: `bg-black/50 backdrop-blur-sm`
- Container: `rounded-2xl`, header com título + botão fechar (X)
- Inputs: `rounded-xl`, labels: `text-sm font-medium`
- Alertas inline de sucesso/erro
- Fecha automaticamente após sucesso (setTimeout 2-3s)

### Hooks (mobile)
- `useCRUD<T>` — hook genérico com paginação, refresh, delete
- Cada entidade tem wrapper: `usePurchases`, `useEarnings`, etc.
- `useMonthNavigation` — estado do seletor de mês (formato `YYYY-MM`)

### Forms
- Sem Formik ou React Hook Form
- Estado manual com `useState` por campo
- Validação via funções puras: `validateLoginForm()`, `validatePurchaseForm()`
- Erros: `axios.isAxiosError()` + `err.response?.data?.message`

## API - Formato Padrão

```typescript
// Resposta de lista
{ statusCode: number, message: T[] }

// Resposta de item único
{ statusCode: number, message: T }

// Erro
{ statusCode: number, message: string }
```

### Params de módulo
- **Earnings/Deductions**: `GET /v1/earnings?year=2026&month=9` (year e month separados)
- **Purchases**: `GET /v1/purchases?month=2026-09` (month como YYYY-MM)
- **Outros**: sem paginação/mês por enquanto

## Contextos

### AuthContext
- `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `updateUser()`
- Web: `localStorage('token')` + `localStorage('user')`
- Mobile: `expo-secure-store` via `secureStorageAdapter`
- JWT decodificado no client para extrair dados do usuário

### FamilyContext
- `families`, `selectedFamily`, `setSelectedFamily()`, `refreshFamilies()`
- Família selecionada determina as pessoas disponíveis nos formulários

### ToastContext (mobile)
- `showToast(message, type)` — notificações inline

## Regras de Negócio no Frontend

1. **Cartão de Crédito**: Tipo F (Físico) recebe `card_name = "Físico"` automaticamente. Tipo VT recebe `card_name = "Temporário"`. Tipo V permite nome livre. Tipos V e VT exigem `physical_card_id` (cartão pai).
2. **Fatura**: Exibe compras por mês/cartão. Status: Aberta (mês atual/futuro), Fechada (mês passado, não paga), Paga (todas compras pagas).
3. **Despesas**: Suportam recriação de recorrentes (`POST /v1/expenses/recreate` com `{ id: expenseId }`) e pagamento individual.
4. **Compras parceladas**: Parcelas gerenciadas via modal separado com pagamento individual.
5. **Parcelamento pós-pagamento**: Após pagar uma compra parcelada, o sistema pergunta se deseja recriar a despesa recorrente.

## Governance

- A constitution deve ser atualizada sempre que novas entidades, padrões ou regras de negócio forem adicionados
- Alterações em services exigem confirmação do contrato backend
- O build (`npm run build` na raiz) deve passar sem erros antes de qualquer merge
- Não adicionar dependências sem justificativa clara
- PT-BR em toda UI e commits
- Branch naming: `feat/fn-{issue}-{description}`

**Version**: 2.0.0 | **Ratified**: 2026-07-21 | **Last Amended**: 2026-09-09
