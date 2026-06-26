<p align="center">
  <img src="https://img.shields.io/badge/python-3.11+-blue.svg" alt="Python 3.11+">
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/SQLAlchemy-2.0-red.svg" alt="SQLAlchemy">
  <img src="https://img.shields.io/badge/SQLite-local-lightgrey.svg" alt="SQLite">
  <img src="https://img.shields.io/badge/PyJWT-auth-yellow.svg" alt="PyJWT">
</p>

<h1 align="center">Finance Backend</h1>

<p align="center">
  FastAPI backend for the <strong>open-finance</strong> personal finance app.
  <br>
  SQLite-powered, JWT-secured, frontend-ready API.
</p>

---

## Features

- **JWT Authentication** with secure password hashing (bcrypt).
- **User-scoped CRUD** for transactions, debts, loans, savings goals, investments, budgets, reminders and categories.
- **camelCase JSON** compatible with the React frontend out of the box.
- **Monthly summary & net worth** endpoints.
- **Seed / reset / clear** endpoints to rebuild demo data.
- **Alembic migrations** for safe schema evolution.
- **SQLite** local database, no Docker needed.

---

## Stack

| Layer            | Technology             |
|------------------|------------------------|
| Framework        | FastAPI 0.115+         |
| ORM              | SQLAlchemy 2.0 (sync)  |
| Database         | SQLite                 |
| Migrations       | Alembic                |
| Auth             | PyJWT + bcrypt         |
| Validation       | Pydantic v2            |
| Lint / Format    | Ruff                   |
| Tests            | pytest                 |

---

## Quick Start

```bash
cd backend
python -m venv .venv
. .venv/Scripts/Activate.ps1   # Windows PowerShell
# source .venv/bin/activate     # Linux / Mac

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

> Tip: you can also run `fastapi dev app/main.py` if you installed `fastapi[standard]`.

Once running, open:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

---

## Verify Quality

```bash
ruff check app tests
ruff format app tests
pytest tests/test_api.py -v
```

Both **ruff** and **pytest** must pass clean before committing.

---

## Authentication

All endpoints (except `/health`, `/api/v1/auth/register`, `/api/v1/auth/login`) require a Bearer token:

```http
Authorization: Bearer <access_token>
```

Login example:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=test@example.com" \
  -d "password=secret123"
```

---

## API Overview

| Method | Endpoint                              | Description                          |
|--------|---------------------------------------|--------------------------------------|
| POST   | `/api/v1/auth/register`               | Create account + default categories  |
| POST   | `/api/v1/auth/login`                  | Get access token                     |
| GET    | `/api/v1/auth/me`                     | Current user profile                 |
| GET    | `/api/v1/categories`                  | List user categories                 |
| GET    | `/api/v1/transactions`                | List transactions                    |
| POST   | `/api/v1/transactions`                | Create transaction                   |
| GET    | `/api/v1/transactions/{id}`           | Get one transaction                  |
| PATCH  | `/api/v1/transactions/{id}`           | Update transaction                   |
| DELETE | `/api/v1/transactions/{id}`           | Delete transaction                   |
| GET    | `/api/v1/debts`                       | List debts                           |
| POST   | `/api/v1/debts`                       | Create debt                          |
| GET    | `/api/v1/debts/{id}`                  | Get one debt                         |
| PATCH  | `/api/v1/debts/{id}`                  | Update debt                          |
| DELETE | `/api/v1/debts/{id}`                  | Delete debt                          |
| GET    | `/api/v1/loans`                       | List loans                           |
| POST   | `/api/v1/loans`                       | Create loan                          |
| GET    | `/api/v1/loans/{id}`                  | Get one loan                         |
| PATCH  | `/api/v1/loans/{id}`                  | Update loan                          |
| DELETE | `/api/v1/loans/{id}`                  | Delete loan                          |
| GET    | `/api/v1/savings-goals`               | List savings goals                   |
| POST   | `/api/v1/savings-goals`               | Create savings goal                  |
| GET    | `/api/v1/savings-goals/{id}`          | Get one savings goal                 |
| PATCH  | `/api/v1/savings-goals/{id}`          | Update savings goal                  |
| DELETE | `/api/v1/savings-goals/{id}`          | Delete savings goal                  |
| POST   | `/api/v1/savings-goals/{id}/contribute` | Add funds                            |
| POST   | `/api/v1/savings-goals/{id}/withdraw` | Withdraw funds                       |
| GET    | `/api/v1/investments`                 | List investments                     |
| POST   | `/api/v1/investments`                 | Create investment                    |
| GET    | `/api/v1/investments/{id}`            | Get one investment                   |
| PATCH  | `/api/v1/investments/{id}`            | Update investment                    |
| DELETE | `/api/v1/investments/{id}`            | Delete investment                    |
| POST   | `/api/v1/investments/{id}/update-value` | Update current price + history     |
| GET    | `/api/v1/budgets`                     | List budgets                         |
| POST   | `/api/v1/budgets`                     | Create budget                        |
| GET    | `/api/v1/budgets/{id}`                | Get one budget                       |
| PATCH  | `/api/v1/budgets/{id}`                | Update budget                        |
| DELETE | `/api/v1/budgets/{id}`                | Delete budget                        |
| GET    | `/api/v1/reminders`                   | List reminders                       |
| POST   | `/api/v1/reminders`                   | Create reminder                      |
| GET    | `/api/v1/reminders/{id}`              | Get one reminder                     |
| PATCH  | `/api/v1/reminders/{id}`              | Update reminder                      |
| DELETE | `/api/v1/reminders/{id}`              | Delete reminder                      |
| GET    | `/api/v1/summary/monthly`              | Monthly income/expense/balance      |
| GET    | `/api/v1/summary/net-worth`            | Net worth breakdown                  |
| POST   | `/api/v1/data/reset`                   | Reset account to seed demo data     |
| POST   | `/api/v1/data/clear`                   | Clear all user data (keep account)  |

---

## Project Structure

```text
backend/
├── alembic/              # Database migrations
├── app/
│   ├── api/              # Routes & dependencies
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── endpoints/
│   │       └── router.py
│   ├── core/             # Config, security, database, constants, exceptions
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Seed & business logic helpers
│   └── main.py           # FastAPI entrypoint
├── data/                 # SQLite files (gitignored)
├── tests/                # pytest suite
├── docs/                 # Documentation (see below)
├── README.md
├── requirements.txt
└── pyproject.toml
```

---

## Conventions

- **Schemas** inherit from `app.schemas.base.CamelModel` to expose `camelCase` JSON compatible with the frontend.
- **Imports** inside `app/` always use the slice root (e.g. `from app.schemas.transaction ...`).
- **CRUD actions** are user-scoped via `current_user` dependency.
- **Derived values** (totals, balances) are computed on the fly; nothing redundant is stored.
- **All changes** must pass `ruff check app tests` and `pytest tests/test_api.py -v`.

---

## Configuration

Copy `.env.example` to `.env` or export variables:

```text
SECRET_KEY=change-me-please-generate-a-secure-random-key-of-at-least-32-chars
DATABASE_URL=sqlite:///./data/finance.db
CORS_ORIGINS=http://localhost:3000
SEED_DEMO_USER=false
```

A `.env` file is **not required** for local development; sensible defaults are provided.

---

## Documentation

See the [`docs/`](./docs) folder for detailed guides:

- [`docs/getting-started.md`](./docs/getting-started.md) — installation & first run
- [`docs/api.md`](./docs/api.md) — endpoint details & example payloads
- [`docs/architecture.md`](./docs/architecture.md) — project structure & conventions
- [`docs/auth.md`](./docs/auth.md) — JWT authentication flow
- [`docs/testing.md`](./docs/testing.md) — how to run and write tests

---

## License

MIT — open source personal finance project.
