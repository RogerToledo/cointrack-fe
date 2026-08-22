# Implementation Plan: Dynamic Dashboard

## Overview

Transform the hardcoded Dashboard component into a data-driven view by creating a dashboard API service, a BRL currency formatter utility, and refactoring the component to fetch and display live financial data with loading/error states and a new categories breakdown section.

## Tasks

- [x] 1. Create currency formatter utility
  - [x] 1.1 Create `src/utils/currency.ts` with the `formatBRL` function
    - Implement pure function that formats numbers to BRL currency (e.g., "R$ 1.234,56")
    - Handle null, undefined, and NaN inputs by returning "R$ 0,00"
    - Handle negative values with "-R$" prefix
    - Use `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })` for locale-correct formatting
    - Always output exactly 2 decimal places
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 1.2 Write property tests for `formatBRL` using fast-check
    - **Property 1: Currency formatting round trip consistency**
    - **Property 2: Null/undefined/NaN values produce zero format**
    - **Property 3: Negative values preserve magnitude**
    - **Validates: Requirements 8.1, 8.2, 8.4, 8.5**

- [x] 2. Create dashboard API service
  - [x] 2.1 Create `src/services/dashboard.tsx` with interfaces and `getDashboard` function
    - Define `DashboardOverview`, `DashboardInstallments`, `CategoryBreakdown`, `DashboardData`, and `DashboardResponse` TypeScript interfaces
    - Implement `getDashboard(period?: string, currency?: string)` async function
    - Import shared Axios instance from `./config`
    - Call `/v1/dashboard` endpoint with optional query params
    - Return `response.data` and let errors propagate to the caller
    - Follow the same patterns as `creditCard.tsx` (export interfaces + async functions)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Checkpoint - Verify service and utility modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Refactor Dashboard component with data fetching and state management
  - [x] 4.1 Add state management and data fetching to `src/components/Dashboard.tsx`
    - Import `useState`, `useEffect` from React
    - Import `getDashboard` from the dashboard service
    - Import `formatBRL` from the currency utility
    - Add state variables: `data` (DashboardData | null), `loading` (boolean, initial: true), `error` (string | null)
    - Implement `fetchDashboardData` async function with try/catch/finally
    - Call `fetchDashboardData` in `useEffect` on mount
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.2 Implement loading and error states in Dashboard component
    - Create `LoadingState` sub-component with spinner animation (animate-spin, border-primary)
    - Create `ErrorState` sub-component with danger alert banner and `AlertCircle` icon from lucide-react
    - Add early returns for loading and error states before main render
    - Import `AlertCircle` from lucide-react
    - _Requirements: 2.2, 2.4, 3.4, 3.5_

  - [x] 4.3 Update StatCard "Disponível" section with dynamic data
    - Display `overview.available_balance` formatted with `formatBRL`
    - Display `overview.available_percentage` rounded to 2 decimal places with "% do orçamento" as trend text
    - Set `trendUp` to true when `available_percentage >= 50`, false otherwise
    - _Requirements: 3.1, 3.2, 3.3, 3.6_

  - [x] 4.4 Update Installments section ("Parcelamentos") with dynamic data
    - Display `installments.active_purchases_count` as integer for "Compras parceladas"
    - Display `installments.total_installments_count` as integer for "Total de parcelas"
    - Display `installments.total_amount` formatted with `formatBRL` for "Valor total"
    - Fall back to "0" for counts and "R$ 0,00" for amount if data is missing
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 4.5 Update Summary section ("Resumo") with dynamic data
    - Display `overview.total_income` formatted with `formatBRL` in "Ganhos" section
    - Display `overview.total_expenses` formatted with `formatBRL` in "Despesas" section
    - Display `overview.available_balance` formatted with `formatBRL` in "Saldo" section
    - Default to "R$ 0,00" if any value is null or undefined
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.6 Update Doughnut chart with dynamic percentage data
    - Replace hardcoded `data` array with values derived from `overview.available_percentage`
    - Set "usado" segment to `100 - available_percentage` and "disponível" to `available_percentage`
    - Maintain existing chart styling (colors, cutout 70%, legend at bottom, point-style labels)
    - Do not render chart if `available_percentage` is null, undefined, or NaN
    - Handle edge cases: 0% renders only "usado", 100% renders only "disponível"
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 5. Checkpoint - Verify Dashboard component renders with mock data
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Categories Breakdown section
  - [x] 6.1 Add "Tipo de compra" section to Dashboard component
    - Create `CategoriesBreakdown` sub-component accepting `CategoryBreakdown[]` prop
    - Render each category with name, amount (formatted with `formatBRL`), and percentage (with 2 decimal places + "%")
    - Sort categories in descending order by percentage before rendering
    - Display empty state message "Nenhum dado de categoria disponível para o período." when array is empty
    - Style consistently with existing card sections (rounded-2xl, border-border pattern)
    - Wire the component into the Dashboard's main render after the charts row
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 6.2 Write property test for categories sort order
    - **Property 5: Categories sort order is descending by percentage**
    - **Validates: Requirements 7.4**

- [x] 7. Checkpoint - Verify doughnut chart and categories section
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Integration and final wiring
  - [ ]* 8.1 Write property test for doughnut chart segments
    - **Property 4: Doughnut chart segments sum to 100**
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 8.2 Write unit tests for Dashboard component
    - Test loading state renders spinner on mount
    - Test error state renders error banner when API fails (mock getDashboard to reject)
    - Test correct values rendered when data is available (mock getDashboard to resolve)
    - Test empty categories show fallback message
    - Test installments fallback values when data is missing
    - _Requirements: 2.2, 2.4, 4.4, 7.3_

  - [ ]* 8.3 Write unit tests for dashboard service
    - Mock Axios instance and verify correct URL `/v1/dashboard` is called
    - Verify optional query params are passed correctly
    - Verify typed response is returned
    - Verify errors are propagated (not caught internally)
    - _Requirements: 1.1, 1.3, 1.4_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses TypeScript with Next.js, so all files use `.tsx` or `.ts` extensions
- fast-check is the PBT library specified in the design for property-based tests
- The existing `StatCard` sub-component is reused as-is with dynamic values

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "4.1"] },
    { "id": 2, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 3, "tasks": ["6.1"] },
    { "id": 4, "tasks": ["6.2", "8.1", "8.2", "8.3"] }
  ]
}
```
