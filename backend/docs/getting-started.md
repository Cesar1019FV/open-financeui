# Getting Started

This guide walks you through installing and running the Finance Backend locally.

## Requirements

- Python 3.11 or newer
- (Optional) `git` for cloning

## 1. Create a virtual environment

```bash
cd backend
python -m venv .venv
```

Activate it:

```bash
# Windows PowerShell
. .venv/Scripts/Activate.ps1

# Linux / Mac
source .venv/bin/activate
```

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

This installs FastAPI, SQLAlchemy, Alembic, PyJWT, bcrypt, pytest, ruff and friends.

## 3. Run migrations

The project uses Alembic to manage the SQLite schema.

```bash
alembic upgrade head
```

This creates `data/finance.db` with all tables.

## 4. Start the server

```bash
uvicorn app.main:app --reload --port 8000
```

Or, if you installed `fastapi[standard]`:

```bash
fastapi dev app/main.py
```

## 5. Check that it works

Open your browser or run:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status": "ok"}
```

You can also explore the interactive docs at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Next steps

- Learn how to authenticate in [`auth.md`](./auth.md).
- See endpoint examples in [`api.md`](./api.md).
- Read about the project structure in [`architecture.md`](./architecture.md).
