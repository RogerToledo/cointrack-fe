# CoinTrack - Constituição do Projeto

## Identidade

**CoinTrack** é um sistema de gerenciamento financeiro pessoal com duas interfaces (web e mobile) que consomem uma API REST compartilhada. O frontend web é Next.js (Pages Router), o mobile é Expo/React Native. Idioma: **PT-BR** em toda UI.

---

## Arquitetura

### Monorepo (pnpm workspaces)

```
cointrack-fe/
  apps/
    web/        @cointrack/web     Next.js 16 + React 19 + Tailwind 4
    mobile/     @cointrack/mobile  Expo 57 + React Native 0.86 + React 19
  packages/
    services/   @cointrack/services  API client factory (plataforma-agnóstico)
    types/      @cointrack/types     Interfaces TypeScript compartilhadas
    utils/      @cointrack/utils     Utilitários (formatBRL, etc)
  src/          ← LEGADO (espelho de apps/web/src/, manter em sync manual)
```

### Regra crítica: src/ legado

O Vercel builda a partir da raiz usando o `tsconfig.json` da raiz que mapeia `@/*` para `./src/*`. Toda alteração em `apps/web/src/` **DEVE** ser copiada para `src/` correspondente. Sempre execute `npm run build` na raiz para validar.

---

## Stack

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

---

## Convenções de Código

### Nomenclatura de arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente | PascalCase | `CreditCard.tsx`, `ModalCreditCard.tsx` |
| Diretório de entidade | lowercase | `creditCard/`, `earning/` |
| Service | camelCase | `creditCard.tsx`, `earning.tsx` |
| Hook | use + PascalCase | `usePurchases.ts`, `useMonthNavigation.ts` |
| Context | PascalCase + Context | `AuthContext.tsx`, `FamilyContext.tsx` |
| Página (web) | camelCase | `creditCard.tsx`, `paymentType.tsx` |
| Util | camelCase | `currency.ts`, `errorMessage.ts` |

### Padrões de componente

- **Sempre** componentes funcionais (nunca class, exceto ErrorBoundary)
- Export default no final do arquivo
- Modal: componente separado `Modal{Entity}.tsx` com props `isOpen`, `onClose`, `on{Action}`
- Web: `function ComponentName()` ou `const ComponentName = () =>`
- Mobile: `export default function ComponentName()`

### Estado

- **Não usar Redux, Zustand ou similar** — usar apenas React Context API
- Contexts: `AuthProvider`, `FamilyProvider`, `ToastProvider` (mobile)
- Ordem de wrapping: `AuthProvider > FamilyProvider > ToastProvider > Layout > Pages`

### Forms

- Sem usar Formik ou React Hook Form
- Estado manual com `useState` por campo
- Validação via funções puras exportadas: `validateLoginForm()`, `validatePurchaseForm()`
- Erros extraídos com `axios.isAxiosError()` + `err.response?.data?.message`

### Estilo (Web)

- Tailwind CSS 4 com custom properties definidas em `globals.css`
- **Nunca** usar cores hardcoded — usar tokens: `text-foreground`, `bg-card`, `border-border`, `text-primary`
- Dark mode automático via `@media (prefers-color-scheme: dark)`
- Bordas arredondadas: `rounded-xl` (padrão)
- Design tokens: `--primary`, `--card`, `--border`, `--success`, `--warning`, `--danger`, etc.

### Estilo (Mobile)

- `StyleSheet.create()` com cores hardcoded (sem theme system compartilhado)
- Expo `userInterfaceStyle: automatic` para light/dark

---

## Camada de Serviço

### Padrão legado (web)

```typescript
// services/config.tsx — instância axios singleton
// services/{entity}.tsx — funções standalone
export const getEarnings = async (year?: number, month?: number) => { ... };
```

### Padrão novo (packages/services)

```typescript
// Factory function plataforma-agnóstico
export function createApiClient(config: ApiClientConfig): AxiosInstance { ... }
export function createCreditCardService(client: AxiosInstance) { ... }
```

O mobile já usa o padrão novo via `apps/mobile/services/api.ts`.

### Convenção de resposta da API

```typescript
{ message: T, statusCode: number }
```

`T` é o payload real (array ou objeto). Sempre verificar `Array.isArray(data.message)` antes de setar state.

### Autenticação

- Token JWT no header `Authorization: Bearer {token}`
- 401 em rotas não-auth → limpar token + redirecionar para `/login`
- Web: `localStorage` | Mobile: `expo-secure-store`
- Token expira em 24h (verificação manual no AuthContext)

---

## mobile: Rotas e Componentes

### Rotas (expo-router file-based)

```
app/
  _layout.tsx              Root: GestureHandler > SafeArea > Auth > Toast > Family
  (auth)/
    login.tsx, register.tsx, forgot-password.tsx
  (tabs)/
    _layout.tsx            Tab navigator (Dashboard, Compras)
    index.tsx              Dashboard
    purchases/
      index.tsx            Lista de compras
      form.tsx             Formulário criar/editar
```

### Componentes reutilizáveis (mobile)

`ConfirmDialog`, `EmptyState`, `ErrorState`, `FamilySelector`, `FormInput`, `LoadingScreen`, `MonthNavigator`, `MonthPicker`, `PullToRefreshList`, `SwipeableRow`, `Toast`

### Hooks (mobile)

`useCRUD<T>` — hook genérico com paginação, refresh, delete. Cada entidade tem um wrapper: `usePurchases`, `useEarnings`, etc.

---

## Regras importantes

1. **Sync manual web/legado**: qualquer mudança em `apps/web/src/` deve ser copiada para `src/`
2. **Build validation**: sempre rodar `npm run build` na raiz antes de commit
3. **Nunca committar secrets** — `.env` está em `.gitignore`
4. **PT-BR** em toda UI e commits
5. **Branch naming**: `feat/fn-{issue}-{description}`
6. **Parcelamento**: compras parceladas usam `POST /v1/expenses/recreate` com `{ id: expenseId }` após pagamento
7. **Month params**: earnings/deductions usam `year` e `month` separados (ex: `?year=2026&month=9`), purchases usa `month=YYYY-MM`
8. **NÃO adicionar dependências** sem necessidade — o projeto é enxuto de propósito
9. **NÃO usar class components** (exceto ErrorBoundary em `_app.tsx`)
10. **Mobile não tem testes escritos** — o `TEST_PLAN.md` existe mas nenhum teste foi implementado

---

## Comandos essenciais

```bash
# Build completo (valida tudo)
npm run build          # na raiz

# Dev web
cd apps/web && npm run dev

# Dev mobile
cd apps/mobile && npx expo start

# Lint
cd apps/web && npm run lint
```

---

## Backend

- URL: `http://127.0.0.1:8180` (dev)
- Proxy configurado no `package.json` da raiz
- Endpoints por módulo: `creditCard`, `deduction`, `earning`, `expense`, `installment`, `paymentType`, `person`, `purchase`, `purchaseType`, `auth`, `dashboard`, `invoice`, `profile`, `family`
