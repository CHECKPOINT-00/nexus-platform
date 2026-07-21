# Research Report: Frontend Architecture & UI/UX

Date: 2026-06-25
Author: Antigravity Researcher 2

## Objective
Detail the implementation strategy for Next.js App Router, TanStack Query data fetching, Better Auth client setup, and Mantine UI v9 layouts.

## Key Insights

### 1. TanStack Query + Virtualization
- TanStack Query v5 is already configured. We will use `useQuery` for listing cases and `useMutation` for form submissions (intake creation, payment upload, report approval).
- Infinite scroll / virtualized tables in the supporter workspace queue will use `@tanstack/react-virtual` (as currently structured in `home-client.tsx`) to handle large case volumes without lag.

### 2. Mantine UI v9 & theme-provider
- Mantine UI v9 is configured with its own MantineProvider for styling and theme management.
- Primary colors will use theme variables (sleek dark violet/indigo background gradient layouts).
- Interactive dashboard tables will utilize the Mantine UI `<Table>` component with selection, custom cells, and sort indicators.

### 3. Conversational Structured Intake
- Stepper design: Instead of a generic long form, the user sees a conversational page.
- Using a step state, the interface displays questions as chat bubbles (`<Card>` or `<Chip>` with micro-animations).
- Action buttons (`<ButtonGroup>`, `<RadioGroup>`) and text fields (`<Textarea>`) appear dynamically as the user progresses.
- Input values are stored in a local React state and validated with a mock AI check before final submission.

## Citations
- [Mantine Table Documentation](https://mantine.dev/core/table/)
- [TanStack Virtualizer API](https://tanstack.com/virtual/v3)
