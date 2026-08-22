# Design Document: Dynamic Dashboard

## Overview

This design transforms the current hardcoded Dashboard component into a data-driven view that fetches live financial data from the backend API. The implementation adds:

1. A **Dashboard service module** following existing service patterns (Axios shared instance, typed responses)
2. A **Currency formatter utility** as a reusable pure function for BRL formatting
3. **State management** in the Dashboard component via `useState`/`useEffect` hooks
4. **Loading and error states** consistent with existing component patterns
5. A new **Categories Breakdown** ("Tipo de compra") section
6. **Dynamic doughnut chart** data driven by API response percentages

The architecture stays aligned with the existing project conventions: services export typed async functions, components manage their own state, and there is no external state management library.

## Architecture

```mermaid
graph TD
    A[Dashboard Page] --> B[Dashboard Component]
    B --> C[useState: DashboardData | null]
    B --> D[useState: loading]
    B --> E[useState: error]
    B --> F[useEffect → fetchData]
    F --> G[Dashboard Service]
    G --> H[Axios Instance /v1/dashboard]
    B --> I[StatCard - Disponível]
    B --> J[Doughnut Chart - Orçamento]
    B --> K[Installments Section - Parcelamentos]
    B --> L[Summary Section - Resumo]
    B --> M[Categories Section - Tipo de compra]
    I --> N[Currency Formatter]
    K --> N
    L --> N
    M --> N
```

**Data flow:**
1. Component mounts → `useEffect` triggers `fetchData`
2. `fetchData` calls `getDashboard()` from the dashboard service
3. On success, state is populated and sections render with formatted values
4. On failure, error state is set and an error banner is displayed
5. While loading, a loading indicator replaces content

## Components and Interfaces

### Dashboard Service (`src/services/dashboard.tsx`)

```typescript
import instance from "./config";

export interface DashboardOverview {
  total_income: number;
  total_expenses: number;
  available_balance: number;
  available_percentage: number;
}

export interface DashboardInstallments {
  active_purchases_count: number;
  total_installments_count: number;
  total_amount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface DashboardData {
  period: string;
  currency: string;
  overview: DashboardOverview;
  installments: DashboardInstallments;
  categories_breakdown: CategoryBreakdown[];
}

export interface DashboardResponse {
  message: DashboardData;
  statusCode: number;
}

export const getDashboard = async (period?: string, currency?: string) => {
  const params: Record<string, string> = {};
  if (period) params.period = period;
  if (currency) params.currency = currency;

  const response = await instance.get<DashboardResponse>('/v1/dashboard', { params });
  return response.data;
};
```

**Design decisions:**
- Follows the same pattern as `creditCard.tsx` and `earning.tsx`: export interfaces + async functions that return `response.data`
- Query params are optional to allow the backend to default to current period/BRL
- Does not catch errors internally — lets the caller (component) handle them, consistent with existing services
- Axios interceptors handle 401 redirects automatically

### Currency Formatter Utility (`src/utils/currency.ts`)

```typescript
export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "R$ 0,00";
  }

  const isNegative = value < 0;
  const absoluteValue = Math.abs(value);

  const formatted = absoluteValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isNegative ? `-${formatted}` : formatted;
}
```

**Design decisions:**
- Pure function with no side effects — easily testable
- Uses `Intl.NumberFormat` via `toLocaleString` for locale-correct formatting
- Handles null/undefined/NaN gracefully by returning "R$ 0,00"
- Handles negative values with explicit minus prefix per Requirement 8.5
- Placed in `src/utils/currency.ts` as a new utility directory (no existing utils dir; this creates the convention)

### Dashboard Component Architecture

The refactored `Dashboard.tsx` component will use three state variables:

```typescript
const [data, setData] = useState<DashboardData | null>(null);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
```

**Component structure:**

```typescript
function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboard();
      setData(response.message);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Não foi possível carregar os dados do dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    // Render sections with data
  );
}
```

**Design decisions:**
- Matches the `fetchData` pattern used in `Earning.tsx` (try/catch, error state, useEffect on mount)
- `loading` starts as `true` since data is fetched immediately on mount
- Early returns for loading and error states keep the happy-path rendering clean
- `StatCard` sub-component is reused as-is with dynamic values

### Loading State

A simple skeleton/spinner consistent with the existing card-based layout:

```typescript
function LoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted mt-1">Visão geral das suas finanças</p>
      </div>
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </div>
  );
}
```

### Error State

Matches the error alert pattern from `Earning.tsx`:

```typescript
function ErrorState({ message }: { message: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted mt-1">Visão geral das suas finanças</p>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-light border border-danger/20" role="alert">
        <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
        <p className="text-sm text-danger flex-1">{message}</p>
      </div>
    </div>
  );
}
```

### Categories Breakdown Section ("Tipo de compra")

A new card section rendered after the existing charts row:

```typescript
function CategoriesBreakdown({ categories }: { categories: CategoryBreakdown[] }) {
  if (categories.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Tipo de compra</h3>
        <p className="text-sm text-muted">Nenhum dado de categoria disponível para o período.</p>
      </div>
    );
  }

  const sorted = [...categories].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Tipo de compra</h3>
      <div className="space-y-3">
        {sorted.map((cat) => (
          <div key={cat.category} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-foreground font-medium">{cat.category}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">{cat.percentage.toFixed(2)}%</span>
              <span className="text-sm font-semibold text-primary">{formatBRL(cat.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Design decisions:**
- Accepts pre-typed `CategoryBreakdown[]` array
- Sorts by percentage descending before rendering (Requirement 7.4)
- Empty state message when no categories exist (Requirement 7.3)
- Styling matches existing card sections (rounded-2xl, border-border pattern)

### Dynamic Doughnut Chart

The chart data is now derived from the API response:

```typescript
const chartData = {
  labels: ['usado', 'disponível'],
  datasets: [{
    label: 'Orçamento',
    data: [100 - (data.overview.available_percentage), data.overview.available_percentage],
    backgroundColor: [
      'rgba(99, 102, 241, 0.8)',
      'rgba(229, 231, 235, 0.6)',
    ],
    borderColor: [
      'rgba(99, 102, 241, 1)',
      'rgba(209, 213, 219, 1)',
    ],
    borderWidth: 2,
    borderRadius: 4,
  }]
};
```

**Design decisions:**
- "usado" = `100 - available_percentage`, ensuring both segments always sum to 100
- Chart options object stays identical (cutout 70%, legend at bottom, point-style labels)
- If `available_percentage` is null/undefined/NaN, the chart is not rendered (loading/error state shown instead)

## Data Models

### API Request

```
GET /v1/dashboard?period={period}&currency={currency}
```

| Parameter  | Type   | Required | Default     |
|-----------|--------|----------|-------------|
| period    | string | No       | Backend default (current month) |
| currency  | string | No       | "BRL"       |

### API Response

```typescript
{
  statusCode: 200,
  message: {
    period: "2025-01",
    currency: "BRL",
    overview: {
      total_income: 72000.00,
      total_expenses: 960.00,
      available_balance: 71040.00,
      available_percentage: 98.67
    },
    installments: {
      active_purchases_count: 2,
      total_installments_count: 2,
      total_amount: 500.00
    },
    categories_breakdown: [
      { category: "Alimentação", amount: 785.00, percentage: 81.82 },
      { category: "Transporte", amount: 175.00, percentage: 18.18 }
    ]
  }
}
```

### Component State Model

| State Variable | Type                  | Initial Value | Purpose                          |
|---------------|-----------------------|---------------|----------------------------------|
| `data`        | `DashboardData \| null` | `null`        | Holds API response data          |
| `loading`     | `boolean`             | `true`        | Controls loading indicator       |
| `error`       | `string \| null`      | `null`        | Holds error message for display  |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Currency formatting round trip consistency

*For any* valid numeric value (integer or decimal), formatting it with `formatBRL` SHALL produce a string that starts with "R$ " (or "-R$ " for negatives), contains exactly one comma followed by exactly two digits at the end, and uses dots as thousands separators.

**Validates: Requirements 8.1, 8.2**

### Property 2: Null/undefined/NaN values produce zero format

*For any* input that is null, undefined, or NaN, `formatBRL` SHALL return exactly "R$ 0,00".

**Validates: Requirements 8.4**

### Property 3: Negative values preserve magnitude

*For any* negative numeric value, `formatBRL(value)` SHALL equal `"-" + formatBRL(Math.abs(value))`.

**Validates: Requirements 8.5**

### Property 4: Doughnut chart segments sum to 100

*For any* valid `available_percentage` value (0 ≤ p ≤ 100), the two chart segments ("usado" = 100 - p, "disponível" = p) SHALL sum to exactly 100.

**Validates: Requirements 6.1, 6.2**

### Property 5: Categories sort order is descending by percentage

*For any* non-empty `categories_breakdown` array, after sorting, each element's percentage SHALL be greater than or equal to the next element's percentage.

**Validates: Requirements 7.4**

## Error Handling

| Scenario | Behavior | UI Feedback |
|----------|----------|-------------|
| API returns error (network/server) | `catch` block sets `error` state | Error banner with message displayed |
| API returns 401 | Axios interceptor clears token, redirects to `/login` | Automatic redirect (existing behavior) |
| `overview.available_percentage` is null/undefined/NaN | Chart is not rendered | Loading/error state shown |
| `categories_breakdown` is empty array | Empty state message shown | "Nenhum dado de categoria disponível para o período." |
| Null/undefined monetary values | `formatBRL` returns "R$ 0,00" | "R$ 0,00" displayed in respective section |
| Installments data missing | Fallback values: counts = 0, total = "R$ 0,00" | Fallback values shown |

**Error propagation strategy:**
- The dashboard service does NOT catch errors — it propagates rejected promises
- The component's `fetchDashboardData` function catches all errors and stores a user-friendly message
- The Axios response interceptor handles authentication errors globally
- No retry logic is implemented initially (can be added later if needed)

## Testing Strategy

### Unit Tests

Unit tests verify specific behaviors with concrete examples:

1. **Dashboard service** — mock Axios instance, verify correct URL/params, verify typed response handling
2. **Currency formatter** — example-based tests for known values: `formatBRL(1234.56)` → `"R$ 1.234,56"`, `formatBRL(null)` → `"R$ 0,00"`, `formatBRL(-500)` → `"-R$ 500,00"`
3. **Dashboard component** — React Testing Library tests:
   - Loading state renders spinner on mount
   - Error state renders error banner when API fails
   - Correct values rendered when data is available
   - Categories sorted correctly
   - Empty categories show fallback message
   - Doughnut chart receives correct data array

### Property-Based Tests

Property-based testing applies specifically to the **Currency Formatter** utility, which is a pure function with a wide input space (all numbers, including edge cases like very large values, very small decimals, negatives, zero).

**Library:** [fast-check](https://github.com/dubzzz/fast-check) — the standard PBT library for TypeScript/JavaScript projects.

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with design property reference

**Tests to implement:**

| Test | Property | Tag |
|------|----------|-----|
| Format structure validation | Property 1 | `Feature: dynamic-dashboard, Property 1: Currency formatting round trip consistency` |
| Null/undefined/NaN handling | Property 2 | `Feature: dynamic-dashboard, Property 2: Null/undefined/NaN values produce zero format` |
| Negative value symmetry | Property 3 | `Feature: dynamic-dashboard, Property 3: Negative values preserve magnitude` |
| Chart segments sum | Property 4 | `Feature: dynamic-dashboard, Property 4: Doughnut chart segments sum to 100` |
| Categories descending sort | Property 5 | `Feature: dynamic-dashboard, Property 5: Categories sort order is descending by percentage` |

### Integration Tests

- Mount the full Dashboard component with a mocked service, verify end-to-end data flow from fetch to render
- Verify that loading → success and loading → error transitions work correctly

### What PBT Does NOT Cover

- React component rendering (use RTL example-based tests)
- API service network calls (use mocked Axios unit tests)
- Axios interceptor behavior (already tested by the existing project infrastructure)
- Visual styling correctness (manual/visual regression testing)
