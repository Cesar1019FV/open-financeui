# Finance

Personal finance app to track income, expenses, debts, loans, savings goals, investments, budgets, and reminders. Built as a frontend SPA with seed data — no backend required to run.

## Features

- **Dashboard** — monthly balance hero with budget progress ring, KPI cards, 6-month comparison chart, expense breakdown pie, upcoming reminders, budget alerts, net worth
- **Income** — salary, variable, passive, other; CRUD transactions filtered by type
- **Expenses** — fixed, variable, occasional; category pie chart; CRUD transactions
- **Balance** — month selector, income vs expense comparison, category breakdown table with percentages
- **Debts** — installment tracking, progress bars, next due date, pay installment action
- **Loans given** — money you lent; partial repayments; auto-derived status (pending/partial/settled)
- **Savings** — goals with donut progress, suggested monthly contribution, emergency fund card
- **Investments** — stocks, crypto, funds, bonds, commodities; sparklines; return percentage; price updates
- **History** — full transaction log with filters (month, type, category, kind, search), pagination, CSV export
- **Settings** — theme (light/dark/system), language (es/en), currency (USD/CRC), category/budget/reminder management, data reset/clear

## Stack

- **Vite 8** (Rolldown) + **React 19** + **TypeScript 6** (strict)
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.js`)
- **React Router 7** (lazy routes)
- **Zustand 5** (state + persist middleware)
- **react-i18next** (es/en, 13 namespaces)
- **date-fns 4**
- **SVG charts** (pie, bar, donut, sparkline) — no chart library
- **SVG icons** — hand-rolled, no icon library
- **FastAPI backend** (optional) in `backend/` — SQLite, JWT, Alembic

## Getting started (frontend)

```bash
yarn install
yarn dev        # dev server (owner only — do not run in CI)
```

For verification:

```bash
yarn lint       # eslint .
yarn build      # tsc -b && vite build
yarn preview    # preview production build
```

## Backend (optional)

A FastAPI backend lives in `backend/` with user-scoped SQLite storage, JWT auth and Alembic migrations.

```bash
cd backend
python -m venv .venv
. .venv/Scripts/Activate.ps1   # or source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

See [`backend/README.md`](./backend/README.md) and [`backend/docs/`](./backend/docs/) for details.

## Architecture

Feature-Sliced Design (FSD). Layers (top → down, strict):

```
app      → entrypoint, router, providers, layouts, styles
pages    → route-level components (10 pages + not-found)
widgets  → composite UI blocks (charts, tables, overviews)
features → user behaviors (forms, dialogs, toggles)
entities → domain models + pure selectors
shared   → ui/, lib/, config/, api/
```

See `AGENTS.md` for full conventions. See `docs/` for feature-level API contracts (ready for backend integration).

## Multi-currency

Each transaction stores its original currency (`USD` or `CRC`). The UI converts all amounts to the active display currency using a fixed rate (`1 USD = 520 CRC`). Switch currency in the topbar.

## i18n

Spanish (`es`) and English (`en`). 13 namespaces per language. Locales are `.ts` modules (not `.json`) at `src/shared/config/locales/{es,en}/`. Switch language in the topbar.

## Data

All data is client-side in a Zustand store persisted to `localStorage` (`finance-store:v1`). Seed data loads on first run. Reset to seed or clear all data in Settings.

## Project structure

```
src/
├── app/           # entrypoint, router, providers, layouts, styles
├── pages/         # 10 route pages + not-found
├── widgets/       # sidebar, topbar, charts, tables, overviews
├── features/      # transaction CRUD, debt-track, toggles, etc.
├── entities/      # transaction, category, debt, loan, savings-goal, etc.
├── shared/        # ui/, lib/, config/, api/
└── main.tsx
docs/              # feature API contracts for backend integration
AGENTS.md          # agent guidance for working in this repo
```

## Monorepo structure

```
open-financeui/
├── src/             # React frontend (Vite + React 19 + Tailwind v4)
├── backend/         # FastAPI backend (SQLite, JWT, Alembic)
├── docs/            # Frontend API contracts for backend integration
├── AGENTS.md        # Agent guidance
└── README.md        # This file
```

## License

Private project.