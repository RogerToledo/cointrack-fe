# Skill: Modern React, TypeScript & Clean Code Best Practices

When writing, refactoring, or reviewing React code, you MUST adhere to modern functional component patterns, strict TypeScript usage, and Clean Code principles.

## Clean Code & Component Architecture
- **Single Responsibility Principle (SRP)**: Keep components small (< 100 lines) and focused on a single UI responsibility.
- **Separation of Concerns**: Isolate business logic, side effects, and API calls into Custom Hooks. Components should focus strictly on UI presentation.
- **Guard Clauses & Early Returns**: Avoid deep JSX conditional nesting (`tertiary hell`). Handle loading, error, and empty states with early returns.
- **Explicit Naming**: Use clear, domain-specific names for components (`UserProfileCard`), custom hooks (`useUserSearch`), and event handlers (`handleFilterChange`).

## Strict TypeScript Standards
- **Explicit Props Typing**: Always define an `interface` or `type` for component props. Never use implicit `any`.
- **Event & Element Types**: Use correct React synthetic event types (e.g., `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent`).
- **Discriminated Unions**: Use union types for component states (e.g., `type State = { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: User }`).

## State Management & Custom Hooks
- **Rules of Hooks**: Call hooks strictly at the top level. Do NOT call hooks inside loops, conditions, or nested functions.
- **Minimal Local State**: Keep state as close to where it is used as possible. Derive state on-the-fly during render instead of storing redundant data in `useState`.
- **Exhaustive Dependencies**: Always include all referenced variables inside `useEffect`, `useCallback`, and `useMemo` dependency arrays to prevent stale closures.

## Rendering & Performance
- **List Rendering Keys**: Always provide a unique, stable string/number `key` prop when rendering lists. Never use array index as a key for dynamic lists.
- **Immutability**: Never mutate state or props directly. Always create new references using spread operators or immutable updater functions.
- **Avoid Anonymous Inline Functions in Loops**: Pass memoized callbacks (`useCallback`) or extract sub-components when passing event handlers inside long lists to prevent unnecessary re-renders.

## Accessibility (a11y) & Testing
- **Semantic HTML**: Use semantic tags (`<header>`, `<nav>`, `<main>`, `<button>`, `<article>`) instead of generic `<div>` wrappers.
- **Accessible Elements**: Ensure interactive elements have accessible names via `aria-label` or visible text. Always use `<button>` for click actions, not `<div onClick={...}>`.
- **Behavior-Driven Tests**: Write component tests (`*.test.tsx`) using React Testing Library, querying elements by accessible role (`getByRole`) or label (`getByLabelText`) rather than implementation details.