# Testing

The project uses `pytest` with `TestClient` for integration tests against an in-memory SQLite database.

## Run tests

```bash
pytest tests/test_api.py -v
```

Run everything:

```bash
pytest
```

## Test database

`tests/test_api.py` creates a dedicated in-memory SQLite engine with `StaticPool` so all requests during a test share the same connection. The `get_db` dependency is overridden so endpoints use the test session instead of the main SQLite file.

## What is tested

Current coverage includes:

- Health check (`GET /health`)
- Full auth flow (register → login → get current user)
- Default categories created on registration
- Transaction CRUD (create, list, get by id, delete)

## Writing new tests

Use the `auth_client` fixture to start from an authenticated user:

```python
def test_something(auth_client: TestClient):
    response = auth_client.get("/api/v1/categories")
    assert response.status_code == 200
```

For unauthenticated endpoints, use the `client` fixture:

```python
def test_health(client: TestClient):
    assert client.get("/health").status_code == 200
```

## Lint and format

Before committing, run:

```bash
ruff check app tests
ruff format app tests
```

Both must pass clean.

## CI-ready commands

```bash
python -c "from app.main import app"
alembic upgrade head
ruff check app tests
pytest tests/test_api.py -v
```

If `alembic upgrade head` fails on an existing database with stale tables, delete `data/finance.db` and rerun.
