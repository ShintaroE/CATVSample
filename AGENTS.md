# Repository Guidelines

## Project Structure & Module Organization
- `src/app/`: Next.js App Router routes and layouts (e.g., `page.tsx`, `layout.tsx`).
- `src/features/<domain>/`: Domain-specific types, hooks, and storage libs (e.g., `applications`, `auth`, `contractor`, `calendar`).
- `src/shared/components/`: Reusable UI and layout components; prefer `ui/` for primitives and `layout/` for shells.
- `src/shared/utils/`: `constants.ts`, `validators.ts`, `formatters.ts` and other helpers.
- `public/`: Static assets (SVG, icons). Path alias `@/*` maps to `src/*`.

## Build, Test, and Development Commands
- `npm install` (or `npm ci`): Install dependencies.
- `npm run dev`: Start local dev server at http://localhost:3000.
- `npm run build`: Production build via Next.js.
- `npm run start`: Serve the production build.
- `npm run lint`: Lint with ESLint (`next/core-web-vitals`, TypeScript rules).

## Coding Style & Naming Conventions
- TypeScript strict mode is enabled; favor precise types and `@/` imports.
- Use functional React components and hooks; avoid class components.
- Files: components in `PascalCase.tsx`, hooks as `useThing.ts`, utilities as `camelCase.ts`.
- Routes: lowercase folder names with hyphens when needed (e.g., `contractor-management`).
- Run `npm run lint` and fix issues before pushing.

## Testing Guidelines
- No test framework is configured yet. When adding tests:
  - Unit/component: Vitest + React Testing Library.
  - E2E: Playwright.
  - Name tests `*.test.ts(x)` and co-locate next to source or in `__tests__/`.
  - Add `"test": "vitest"` to `package.json` scripts.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits: `feat(scope): message`, `fix(scope): message`, `refactor(...)`, `docs(...)`. Mixed English/Japanese messages are acceptable; be clear and scoped (e.g., `feat(applications): 申請管理の絞り込み機能`).
- PRs should include:
  - Concise description and motivation; link issues (e.g., `Closes #123`).
  - UI changes: screenshots/GIFs.
  - Checklist: builds, `npm run lint` passes.

## Security & Configuration
- Store secrets in `.env.local`; never commit secrets. Restart dev server after env changes.
- Avoid importing server-only code into client components.

