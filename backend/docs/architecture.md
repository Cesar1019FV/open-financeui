# Architecture

The backend follows a layered structure inspired by Feature-Sliced Design (FSD), adapted for FastAPI.

```text
backend/
├── alembic/          # Database migrations
├── app/
│   ├── api/          # Routes and dependency injection
│   │   ├── deps.py   # Common dependencies (db, current_user)
│   │   └── v1/
│   │       ├── endpoints/   # One module per entity
│   │       │   ├── auth.py
│   │       │   ├── categories.py
│   │       │   ├── transactions.py
│   │       │   ├── debts.py
│   │       │   ├── loans.py
│   │       │   ├── savings_goals.py
│   │       │   ├── investments.py
│   │       │   ├── budgets.py
│   │       │   ├── reminders.py
│   │       │   ├── summary.py
│   │       │   └── data.py
│   │       └── router.py
│   ├── core/         # Cross-cutting concerns
│   │   ├── config.py
│   │   ├── constants.py
│   │   ├── database.py
│   │   ├── exceptions.py
│   │   └── security.py
│   ├── models/       # SQLAlchemy declarative models
│   ├── schemas/      # Pydantic request/response models
│   ├── services/     # Seed and helper logic
│   └── main.py       # FastAPI application factory
├── tests/            # pytest integration tests
└── docs/             # Project documentation
```

## Dependency direction

Dependencies point inward:

```text
api → schemas, models, services, core
services → models, core
models → core.database / base
schemas → core.constants
```

No lower layer imports from a higher layer.

## Core principles

### 1. Single SQLite database per user

Every user owns their rows. There is no global/shared data except the application code. Default categories are copied per user on registration.

### 2. camelCase JSON

The frontend expects `camelCase` (e.g. `categoryId`, `targetAmount`, `isDefault`). The backend uses Pythonic `snake_case` internally. The bridge is `app.schemas.base.CamelModel`, which uses Pydantic's `alias_generator` to serialize and accept both styles.

### 3. Computed, not stored

Derived values such as monthly balance, remaining debt, or net worth are calculated from persisted data on each request. This keeps the schema simple and avoids stale totals.

### 4. Sync SQLAlchemy 2.0

We use sync sessions for simplicity with SQLite. `get_db()` yields a session per request and rolls back on unhandled exceptions.

### 5. Auth via dependency injection

`CurrentUserDep` resolves the user from the JWT in every protected endpoint. Endpoints never parse the token manually.

### 6. Pydantic v2 everywhere

All request bodies, response models and validators use Pydantic v2. `ConfigDict(from_attributes=True)` lets FastAPI serialize SQLAlchemy objects directly through the response model.

## Adding a new entity

1. Add the SQLAlchemy model under `app/models/<entity>.py`.
2. Import it in `app/models/__init__.py` so Alembic detects it.
3. Add Pydantic schemas under `app/schemas/<entity>.py`, inheriting from `CamelModel`.
4. Add CRUD endpoints under `app/api/v1/endpoints/<entity>.py`.
5. Wire the router in `app/api/v1/router.py`.
6. Add a migration with `alembic revision --autogenerate -m "Add <entity>"`.
7. Add integration tests in `tests/test_api.py` or a new file.

## Migrations

Generate a migration after any model change:

```bash
alembic revision --autogenerate -m "Describe change"
alembic upgrade head
```

Always review the generated script before committing.
