# AI Rules & Guidelines for this React App Project

## Tech Stack

1. **Frontend Framework**: React (v18+) — Core UI components and state management using functional components + hooks (`useState`, `useEffect`).
2. **Language**: TypeScript — Strongly typed codebase with interface-based component prop definitions.
3. **Styling System**: Tailwind CSS v3+ — Utility-first CSS framework for responsive, consistent styling without custom builds.
4. **Build Tooling & Package Manager**: Vite + npm/yarn/pnpm — Fast dev server (~200ms full reload), optimized production bundling.
5. **Routing (optional)**: React Router (v6+) — Declarative routing when pages/navigation are needed (`createBrowserRouter`).
6. **Validation**: Zod or Yup — Form schema validation for inputs if form functionality is implemented later.
7. **Forms UI**: shadcn/ui components + Radix Primitives - Atomic design system accessible and customizable with Tailwind, used sparingly.
8. **Icons**: lucide-react — Lightweight icon set matching project aesthetic; import from `lucide-react` library.
9. **Toast Notifications (optional)**: react-hot-toast/sonner — Context-based toast for user feedback on actions/events (only if needed).
10. **State Management **(avoid unnecessary complexity) Zustand or Redux Toolkit — Simple state solutions when multiple components need shared data.

## Library Usage Rules

| Task | Recommended Approach | Reasoning & Alternatives to Avoid |
|------|---------------------|-----------------------------------|
| **Styling classes** | Tailwind utility classes ONLY | Do NOT use CSS modules, pre-processors (SCSS) unless absolutely necessary for design systems that need nesting/media queries not handled by utilities. |
| **State lifting up vs downs?** Lift to smallest common ancestor where needed or pass down functions as callbacks explicitly declared with types first before implementation occurs — this prevents accidental re-renders due to inline function recreation inside JSX props rendering too often under development cycles like hot reloading features active simultaneously without performance degradation concerns across multiple browser tabs running parallel tests environments today | Always define reusable pure render methods outside of components whenever possible for memoized output consistency checks after updates trigger frequently during debugging sessions involving console.log statements within useEffect blocks executing side effects improperly synchronously<dyad-write path="AI_RULES.md" description="Creating an AI_RULES.md file with tech stack documentation and library guidelines">
# AI Rules & Guidelines for this React App Project

## Tech Stack Overview (5-10 Bullet Points)

1. **Frontend**: React 18+ — Core UI system using functional components, hooks (`useState`, `useEffect`, `useMemo`)

2. **Language**: TypeScript — All code must be typed; interfaces for component props and function parameters required

3. **Styling**: Tailwind CSS v3+ — Utility-first classes only; no custom CSS files unless absolutely needed

4. **Build Tooling**: Vite + npm/pnpm/yarn — Fast#