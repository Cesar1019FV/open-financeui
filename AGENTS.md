# AGENTS.md

Project-specific guidance for OpenCode agents working in this repo.

## Stack

- Vite 8 (Rolldown) + React 19 + TypeScript 6 (strict, `verbatimModuleSyntax`)
- Tailwind CSS v4 via `@tailwindcss/vite` — **no `tailwind.config.js`**; theme tokens defined with `@theme` in `src/app/styles/index.css`
- React Router 7 (`react-router-dom`), Zustand 5 (state + `persist` middleware), react-i18next (es/en), date-fns 4
- Package manager: **yarn** (lockfile committed, do not switch to npm/pnpm)

## Commands

```bash
yarn install          # install deps
yarn lint             # eslint .  — run first
yarn build            # tsc -b && vite build  — primary verification
yarn preview          # preview production build
```

**Never run `yarn dev`.** The dev server is started by the owner only.

After any code change, verify with `yarn lint` → `yarn build` (in that order). Both must pass clean (0 errors, 0 warnings).

If `tsc` reports stale "Cannot find module" errors that look wrong, delete `node_modules/.tmp/*.tsbuildinfo` and rerun — the build-info cache can lie after file moves.

## Architecture: Feature-Sliced Design (FSD)

`src/` layers, dependency direction **strictly top → down only**:

```
app      → all lower layers
pages    → widgets, features, entities, shared
widgets  → features, entities, shared
features → entities, shared
entities → shared only
shared   → no upward imports
```

Never import from a higher layer into a lower one. No cross-slice imports except via a slice's public API (`index.ts`).

| Layer | Purpose |
|-------|---------|
| `app/` | Entrypoint (`index.tsx`), `router.tsx`, `providers/`, `layouts/`, `styles/index.css` |
| `pages/` | Route-level page components (10 pages + not-found) |
| `widgets/` | Composite UI blocks (charts, tables, overviews, hero) |
| `features/` | User behaviors (verbs): `transaction-create`, `debt-track`, `theme-toggle`, etc. |
| `entities/` | Domain models (nouns): `transaction`, `category`, `debt`, `loan`, `savings-goal`, `investment`, `budget`, `reminder`, `account-summary` |
| `shared/` | `ui/`, `lib/`, `config/`, `api/` |

### Segments inside a slice

`ui/`, `api/`, `model/`, `lib/`, `config/`. Presentation in `ui/`, types+selectors in `model/`, data access in `api/`.

- `entities/` slices expose types from `model/types.ts` and pure selectors from `model/selectors.ts`; both re-exported via the slice `index.ts`.
- `features/` slices typically have `ui/` (forms, dialogs) and an `index.ts`; they consume the store and entities.
- `shared/ui` is a component library (Button, Card, Modal, Table, Icon, etc.) — each component in its own folder with its own `index.ts`, all re-exported from `shared/ui/index.ts`.

## Import conventions

- **Always import via a slice's `index.ts`**, never via deep internal paths.
  - ✓ `import { BalanceHero } from '@/widgets/balance-hero'`
  - ✗ `import { BalanceHero } from '@/widgets/balance-hero/ui/BalanceHero'`
- Alias `@` → `src` (configured in `vite.config.ts` and `tsconfig.app.json` `paths`, no `baseUrl`). Use `@/...` for all cross-slice imports; relative imports only within the same slice.
- `.tsx`/`.ts` files imported **without extension**. Do not add `.js`/`.ts` extensions to relative imports — `moduleResolution: bundler` resolves them.

## File-naming gotcha (hard-won)

**A `.ts` file and a folder of the same name cannot coexist in the same parent.** Module resolution for `./i18n` from `config/i18n.ts` resolves to `config/locales/...` only if locales live in `config/locales/`, NOT `config/i18n/locales/`. The `i18n.ts` initializer lives at `shared/config/i18n.ts`; locale modules live at `shared/config/locales/{es,en}/*.ts`.

## i18n locales are `.ts`, not `.json`

Rolldown could not resolve `.json` imports. Locales are TS modules: `shared/config/locales/{es,en}/{namespace}.ts`, each `export default { ... }`. 13 namespaces per language: `common`, `nav`, `dashboard`, `income`, `expenses`, `balance`, `debts`, `loans`, `savings`, `investments`, `history`, `settings`, `validation`. All imported statically in `shared/config/i18n.ts`.

When adding a namespace: create the `.ts` file in both `es/` and `en/`, then add an import line and a resource entry in `i18n.ts`.

## State: Zustand store

Single store at `shared/api/store.ts` with `persist` middleware (`name: 'finance-store:v1'`, versioned). Seed data in `shared/api/seed.ts` is loaded via a lazy initializer. The store exposes CRUD actions for every entity (transactions, categories, debts, loans, savingsGoals, investments, budgets, reminders) plus `resetToSeed()` and `clearAll()`.

- `partialize` excludes `historyFilters` (UI state) from persistence.
- All CRUD handlers use functional `set(state => ...)` — never read state outside the updater.
- **Derived values (totals, balances, summaries) are computed in render via entity selectors**, never stored as state and never updated in effects. See `entities/account-summary/model/selectors.ts`.

## Providers (app/providers/)

Each provider is split into two files to satisfy `react-refresh/only-export-components`:
- `useX.ts` — `createContext` + `useX` hook (no JSX)
- `XProvider.tsx` — the component only

Hooks: `useTheme`, `useLocale`, `useCurrency`, `useToast`, `useCommandPalette`. All re-exported from `app/providers/index.ts`. Composed in `AppProviders.tsx`.

- `useCurrency().format(amount, fromCurrency)` is the canonical way to format money. It converts to the active display currency and uses `Intl.NumberFormat` with the active locale. Do not call `Intl.NumberFormat` for currency directly in components.
- `formatYearMonth(date)` and `formatISODate(date)` live in `entities/transaction` (not `account-summary`).
- Theme/locale/currency persist to `localStorage` keys `finance-theme`, `finance-locale`, `finance-currency`. `index.html` has an inline script that applies `.dark` and `<html lang>` before hydration to avoid FOUC.

## Styling

- Tailwind utilities directly in JSX. No CSS modules, no styled-components, no per-component `.css`.
- Global styles only in `src/app/styles/index.css`: `@import "tailwindcss"`, Google Fonts `@import`, `@custom-variant dark`, `@theme` tokens, `@layer base` resets, keyframes, reduced-motion media query.
- Dark mode: `.dark` class on `<html>`, variant declared via `@custom-variant dark (&:where(.dark, .dark *))`.
- Theme tokens (colors, fonts, radii, shadows, easings, animations) are CSS custom properties in `@theme`. Tailwind v4 generates utilities from them: `bg-canvas`, `text-ink`, `border-line`, `bg-brand-500`, `text-ink-muted`, etc.
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (monetary figures with `font-variant-numeric: tabular-nums`). Loaded via Google Fonts `@import` in `index.css` + `preconnect` in `index.html`.
- SVG charts (pie, bar, donut, sparkline) are hand-rolled — no chart library. Icon set is hand-rolled SVG in `shared/ui/Icon` — no icon library.

## ESLint quirks (react-hooks v7)

The lint config is strict and enforces rules an agent will trip on:

- **`react-hooks/set-state-in-effect`**: do not call `setState` synchronously inside `useEffect` to derive state from props/other state. Derive during render instead. External-system sync (DOM, subscriptions, `localStorage` writes) is fine.
- **`react-hooks/immutability`**: do not reassign `let` variables inside `.map()` during render. Compute cumulative values with `reduce`/`slice(0, i).reduce(...)` instead.
- **`react-refresh/only-export-components`**: a `.tsx` file that exports a component may not also export hooks/constants. Split hooks into a separate `useX.ts`. Barrel `index.ts` files (no JSX) are exempt.
- **`react-hooks/exhaustive-deps`**: if you build an intermediate object used by `useMemo`, wrap it in its own `useMemo` or the deps change every render.

## TypeScript quirks

- `verbatimModuleSyntax` is on: use `import { type X }` / `export { type X }` for type-only imports/exports.
- `noUnusedLocals` + `noUnusedParameters`: remove unused vars/params/imports before building. Unused imports are the #1 build failure.
- `resolveJsonModule` is on but JSON imports don't resolve under Rolldown — use `.ts` modules for data (see i18n above).
- No `baseUrl` (TS 6 deprecation); `@` alias uses `paths` only.

## Adding a new feature (checklist)

1. Create the slice folder under the correct layer (`features/my-feature/`).
2. Add `ui/` segment with components.
3. Create `index.ts` re-exporting the public API.
4. If it needs state, add actions to `shared/api/store.ts` (do not create a second store).
5. Import it from higher layers via `@/features/my-feature`.
6. Run `yarn lint && yarn build` to verify.

## Do not

- Do not run `yarn dev`.
- Do not create `tailwind.config.js`.
- Do not import across slices bypassing `index.ts`.
- Do not add `baseUrl` to tsconfig.
- Do not create a `.ts` file and a same-named folder as siblings.
- Do not call `setState` in `useEffect` to derive state from props/state.
- Do not add comments to code unless explicitly asked — code should be self-explanatory.
- Do not commit `dist/` (gitignored).