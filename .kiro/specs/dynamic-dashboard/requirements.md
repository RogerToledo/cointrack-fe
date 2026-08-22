# Requirements Document

## Introduction

The Dynamic Dashboard feature replaces hardcoded values in the Dashboard component with live data fetched from a backend API. The dashboard displays financial overview data including available balance, installment summaries, income/expense breakdown, and category-level spending. Data is fetched on component mount, formatted as Brazilian currency (BRL), and rendered with appropriate loading and error states.

## Glossary

- **Dashboard_Service**: The service module responsible for fetching dashboard data from the backend API endpoint.
- **Dashboard_Component**: The React component that renders the financial overview, installments, summary, and categories breakdown sections.
- **API_Response**: The JSON response from the backend with structure `{ statusCode: number, message: DashboardData }`.
- **Currency_Formatter**: The utility responsible for formatting numeric values into Brazilian Real (BRL) currency strings (e.g., `R$ 72.000,00`).
- **Doughnut_Chart**: The Chart.js doughnut visualization showing budget usage vs. available balance.
- **Categories_Breakdown**: A new dashboard section displaying expense distribution by category with amounts and percentages.

## Requirements

### Requirement 1: Dashboard Service Creation

**User Story:** As a developer, I want a dedicated dashboard service module, so that dashboard data fetching follows the same patterns as other services in the project.

#### Acceptance Criteria

1. THE Dashboard_Service SHALL export an async function named `getDashboard` that accepts optional `period` (string) and `currency` (string) query parameters and calls the `/v1/dashboard` endpoint using a GET request via the shared Axios instance.
2. THE Dashboard_Service SHALL define TypeScript interfaces for the API_Response payload including: `period` (string), `currency` (string), `overview` (object containing numeric income, expenses, and balance fields), `installments` (object containing numeric count and total fields), and `categories_breakdown` (array of objects each containing a category name and numeric amount).
3. WHEN the API returns a successful response, THE Dashboard_Service SHALL return the typed response data matching the defined interface to the caller.
4. IF the API request fails, THEN THE Dashboard_Service SHALL propagate the rejected promise to the caller, allowing the shared Axios interceptor to handle authentication errors.
5. THE Dashboard_Service SHALL reside at `src/services/dashboard.tsx` following the existing service file conventions, importing the shared Axios instance from `./config`.

### Requirement 2: Data Fetching on Component Mount

**User Story:** As a user, I want the dashboard to load current financial data when I open it, so that I always see up-to-date information.

#### Acceptance Criteria

1. WHEN the Dashboard_Component mounts, THE Dashboard_Component SHALL call the Dashboard_Service to fetch dashboard data.
2. WHILE data is being fetched, THE Dashboard_Component SHALL display a loading indicator that replaces the dashboard content area.
3. WHEN the API returns data successfully, THE Dashboard_Component SHALL render the financial data in the Disponível, Parcelamentos, Resumo, Orçamento chart, and Tipo de compra sections.
4. IF the API request fails, THEN THE Dashboard_Component SHALL display an error message informing the user that data could not be loaded.

### Requirement 3: Available Balance Display

**User Story:** As a user, I want to see my current available balance prominently on the dashboard, so that I can quickly assess my financial standing.

#### Acceptance Criteria

1. WHEN the dashboard API response is successfully received, THE Dashboard_Component SHALL display the `overview.available_balance` value formatted as BRL currency in the "Disponível" stat card.
2. WHEN the dashboard API response is successfully received, THE Dashboard_Component SHALL display the `overview.available_percentage` value rounded to 2 decimal places, followed by "% do orçamento" as the trend text.
3. THE Currency_Formatter SHALL format the available balance with the "R$" prefix, dots as thousands separators, a comma as the decimal separator, and exactly 2 decimal places (e.g., "R$ 71.040,00").
4. WHILE the dashboard data is being fetched, THE Dashboard_Component SHALL display a loading indicator in place of the stat card values.
5. IF the dashboard data fetch fails, THEN THE Dashboard_Component SHALL display an error message indicating that the financial data could not be loaded.
6. WHEN the `overview.available_percentage` is greater than or equal to 50, THE Dashboard_Component SHALL display the trend indicator as positive (upward); WHEN the `overview.available_percentage` is less than 50, THE Dashboard_Component SHALL display the trend indicator as negative (downward).

### Requirement 4: Installments Section Display

**User Story:** As a user, I want to see a summary of my active installment purchases, so that I can track my recurring commitments.

#### Acceptance Criteria

1. WHEN dashboard data is loaded successfully, THE Dashboard_Component SHALL display `installments.active_purchases_count` as a numeric integer value in the "Compras parceladas" row.
2. WHEN dashboard data is loaded successfully, THE Dashboard_Component SHALL display `installments.total_installments_count` as a numeric integer value in the "Total de parcelas" row.
3. WHEN dashboard data is loaded successfully, THE Dashboard_Component SHALL display `installments.total_amount` formatted as BRL currency using pt-BR locale (e.g., "R$ 500,00") in the "Valor total" row.
4. IF dashboard data fails to load, THEN THE Dashboard_Component SHALL display the Installments section with placeholder or fallback values of "0" for counts and "R$ 0,00" for the total amount.
5. WHILE dashboard data is being fetched, THE Dashboard_Component SHALL display a loading indicator in the Installments section until data is available or an error occurs.

### Requirement 5: Financial Summary Display

**User Story:** As a user, I want to see my total income, expenses, and balance in a summary section, so that I have a quick overview of cash flow.

#### Acceptance Criteria

1. WHEN dashboard data is loaded, THE Dashboard_Component SHALL display `overview.total_income` formatted as BRL currency using `pt-BR` locale (e.g., "R$ 72.000,00") in the "Ganhos" section.
2. WHEN dashboard data is loaded, THE Dashboard_Component SHALL display `overview.total_expenses` formatted as BRL currency using `pt-BR` locale (e.g., "R$ 960,00") in the "Despesas" section.
3. WHEN dashboard data is loaded, THE Dashboard_Component SHALL display `overview.available_balance` formatted as BRL currency using `pt-BR` locale (e.g., "R$ 71.040,00") in the "Saldo" section.
4. IF `overview.total_income`, `overview.total_expenses`, or `overview.available_balance` is null or undefined, THEN THE Dashboard_Component SHALL display "R$ 0,00" in the corresponding section.

### Requirement 6: Doughnut Chart with Dynamic Data

**User Story:** As a user, I want the budget chart to reflect my actual usage, so that I can visually understand my spending ratio.

#### Acceptance Criteria

1. WHEN dashboard data is loaded, THE Doughnut_Chart SHALL use `overview.available_percentage` (a numeric value between 0 and 100 inclusive) as the "disponível" segment value.
2. WHEN dashboard data is loaded, THE Doughnut_Chart SHALL calculate the "usado" segment as `100 - overview.available_percentage`, ensuring both segments sum to exactly 100.
3. THE Doughnut_Chart SHALL maintain the existing visual styling (colors, cutout percentage, legend position at bottom, and point-style legend labels).
4. IF `overview.available_percentage` is null, undefined, or not a number, THEN THE Doughnut_Chart SHALL not render the chart and the Dashboard_Component SHALL display the loading or error state as defined in Requirement 2.
5. WHEN `overview.available_percentage` is 0, THE Doughnut_Chart SHALL render only the "usado" segment at 100. WHEN `overview.available_percentage` is 100, THE Doughnut_Chart SHALL render only the "disponível" segment at 100.

### Requirement 7: Categories Breakdown Section

**User Story:** As a user, I want to see my expenses broken down by category, so that I can identify where I spend the most.

#### Acceptance Criteria

1. WHEN dashboard data is loaded, THE Dashboard_Component SHALL render a "Tipo de compra" section listing each entry from `categories_breakdown`.
2. WHEN dashboard data is loaded, THE Dashboard_Component SHALL display each category's name, amount formatted as BRL currency, and percentage displayed as a number followed by "%" (e.g., "81.82%") for each entry.
3. IF `categories_breakdown` is empty, THEN THE Dashboard_Component SHALL display a message indicating no category data is available for the period.
4. WHEN dashboard data is loaded, THE Dashboard_Component SHALL render category entries in descending order by percentage value, so the highest-spending category appears first.

### Requirement 8: Currency Formatting

**User Story:** As a user, I want all monetary values displayed in Brazilian Real format, so that the information is immediately readable.

#### Acceptance Criteria

1. THE Currency_Formatter SHALL format numbers using the BRL locale with "R$" prefix, dots for thousands separation, and comma for decimal separation (e.g., "R$ 1.234,56").
2. THE Currency_Formatter SHALL always display exactly two decimal places for monetary values.
3. WHEN the API response `currency` field is "BRL", THE Currency_Formatter SHALL use the Brazilian Real formatting rules.
4. IF the input value is null, undefined, or not a valid number, THEN THE Currency_Formatter SHALL display "R$ 0,00".
5. WHEN the input value is negative, THE Currency_Formatter SHALL display the formatted absolute value prefixed with a minus sign (e.g., "-R$ 1.234,56").
6. IF the API response `currency` field is missing or is not "BRL", THEN THE Currency_Formatter SHALL default to Brazilian Real formatting rules.
