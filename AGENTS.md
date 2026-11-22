# CoinTrack - Constituição do Projeto

## Identidade

**CoinTrack** é um sistema de gerenciamento financeiro pessoal com duas interfaces (web e mobile) que consomem uma API REST compartilhada. O frontend web é Next.js (Pages Router), o mobile é Expo/React Native. Idioma: **PT-BR** em toda UI.

---

## Arquitetura

### Monorepo (pnpm workspaces)

```
cointrack-fe/
  apps/
    web/        @cointrack/web       Next.js 16 + React 19 + Tailwind 4
    mobile/     @cointrack/mobile    Expo 57 + React Native 0.86 + React 19
  packages/
    services/   @cointrack/services  API client e factories plataforma-agnósticas
    types/      @cointrack/types     Interfaces TypeScript compartilhadas
    utils/      @cointrack/utils     Utilitários compartilhados (formatBRL, JWT, datas, erros, paleta)
```

### Deploy (Vercel)

O projeto Web vive exclusivamente em `apps/web` (fonte única de verdade). Configure o **Root Directory** na Vercel para `apps/web` usando `pnpm`.

---

## Stack

| Camada | Web | Mobile |
|--------|-----|--------|
| Framework | Next.js 16 (Pages Router) | Expo SDK 57 |
| React | 19 | 19.2 |
| Linguagem | TypeScript 5 (strict) | TypeScript 6 (strict) |
| Estilo | Tailwind 4 + CSS vars (`globals.css`) | `StyleSheet.create()` + `constants/theme.ts` |
| UI | Biblioteca interna `components/ui/` + Lucide React | Componentes nativos + Ionicons |
| HTTP | Axios via `@cointrack/services` | Axios via `@cointrack/services` |
| Gráficos | Chart.js 4 + react-chartjs-2 | — |
| State | React Context API | React Context API |
| Segurança | localStorage (token) | expo-secure-store |
| Gerenciador | pnpm workspaces | pnpm workspaces |

---

## Paleta Oficial & Tokens

| Papel | Nome | HEX | Token Web |
|-------|------|-----|-----------|
| Fundo Principal | Branco Gelo | `#F8FAFC` | `--background` (`bg-background`) |
| Superfícies / Cards | Branco Puro | `#FFFFFF` | `--card` (`bg-card`) |
| Primária (Ação) | Azul Cobalto | `#1D4ED8` | `--primary` (`bg-primary`) |
| Primária (Escura) | Azul Marinho | `#0F172A` | `--foreground` (`text-foreground`) |
| Secundária (Destaque) | Azul Céu | `#0EA5E9` | `--accent` (`text-accent`) |
| Sucesso / Positivo | Verde Esmeralda | `#10B981` | `--success` (`bg-success` / `text-success`) |
| Sucesso (Suave) | Verde Menta Claro | `#ECFDF5` | `--success-light` (`bg-success-light`) |
| Bordas e Divisores | Cinza Azulado | `#E2E8F0` | `--border` (`border-border`) |

---

## Convenções de Código

### Componentes UI (Web)

Use sempre os primitivos em `apps/web/src/components/ui/`: `Button`, `IconButton`, `Badge`, `Card`, `PageHeader`, `MonthNavigator`, `Modal`, `ConfirmDialog`, `Alert`, `EmptyState`, `TableSkeleton`, `CardSkeleton`, `Pagination`, `Input`, `Select`, `Checkbox`.

- **Nunca** usar `window.confirm()` ou `alert()` — usar `ConfirmDialog` e `useToast()`
- **Nunca** usar cores hardcoded — usar tokens semânticos (`bg-background`, `bg-card`, `bg-primary`, `text-foreground`, `text-accent`, `bg-success`, `bg-success-light`, `border-border`)
- **Sempre** componentes funcionais (nunca class, exceto ErrorBoundary em `_app.tsx`)
- **Não usar Redux, Zustand ou similar** — usar apenas React Context API (`AuthProvider > FamilyProvider > ToastProvider > Layout > Pages`)

### Camada de Serviço

Todos os contratos e chamadas HTTP vivem em `packages/services/src/` com tipos em `packages/types/src/`.
- Web instancia em `apps/web/src/services/api.ts` (com façades `.ts` por módulo)
- Mobile instancia em `apps/mobile/services/api.ts`

### Convenção de resposta da API

```typescript
{ message: T, statusCode: number }
```

Sempre verificar `Array.isArray(data.message)` antes de setar state.

---

## Regras importantes

1. **Build & quality validation**: sempre rodar `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build` antes de commit
2. **Nunca committar secrets** — `.env` está em `.gitignore`
3. **PT-BR** em toda UI e commits
4. **Branch naming**: `feat/fn-{issue}-{description}`
5. **Parcelamento**: despesas recorrentes usam `POST /v1/expenses/recreate` com `{ id: expenseId }` após pagamento
6. **Month params**: earnings/expenses usam `year` e `month` separados (ex: `?year=2026&month=9`), purchases usa `month=YYYY-MM`
7. **NÃO adicionar dependências** sem necessidade — o projeto é enxuto de propósito

---

## Comandos essenciais

```bash
# Validação completa
pnpm typecheck
pnpm lint
pnpm test
pnpm build

# Dev web
pnpm dev

# Dev mobile
pnpm mobile
```
