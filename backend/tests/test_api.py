import pytest
from fastapi.testclient import TestClient
from sqlalchemy import StaticPool, create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app

DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def auth_client(client: TestClient):
    register = client.post(
        "/api/v1/auth/register", json={"email": "test@example.com", "password": "secret123"}
    )
    assert register.status_code == 201
    login = client.post(
        "/api/v1/auth/login", data={"username": "test@example.com", "password": "secret123"}
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client


def test_health(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_auth_flow(client: TestClient):
    register = client.post(
        "/api/v1/auth/register", json={"email": "test@example.com", "password": "secret123"}
    )
    assert register.status_code == 201
    login = client.post(
        "/api/v1/auth/login", data={"username": "test@example.com", "password": "secret123"}
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "test@example.com"


def test_default_categories_are_created_on_register(auth_client: TestClient):
    response = auth_client.get("/api/v1/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) > 0
    name_keys = {c["nameKey"] for c in categories}
    assert "common:categories.salary" in name_keys
    income_category = next(c for c in categories if c["type"] == "income")
    assert income_category["kind"] in {"salary", "variable", "passive", "other"}


def test_transaction_crud(auth_client: TestClient):
    categories = auth_client.get("/api/v1/categories").json()
    income_category = next(c for c in categories if c["type"] == "income")

    tx = auth_client.post(
        "/api/v1/transactions",
        json={
            "type": "income",
            "categoryId": income_category["id"],
            "amount": 1000,
            "currency": "USD",
            "date": "2024-06-25",
            "description": "Paycheck",
        },
    )
    assert tx.status_code == 201
    tx_id = tx.json()["id"]

    get_tx = auth_client.get(f"/api/v1/transactions/{tx_id}")
    assert get_tx.status_code == 200
    assert get_tx.json()["amount"] == 1000
    assert get_tx.json()["categoryId"] == income_category["id"]

    list_tx = auth_client.get("/api/v1/transactions")
    assert list_tx.status_code == 200
    assert any(t["id"] == tx_id for t in list_tx.json())

    delete_tx = auth_client.delete(f"/api/v1/transactions/{tx_id}")
    assert delete_tx.status_code == 204

    get_deleted = auth_client.get(f"/api/v1/transactions/{tx_id}")
    assert get_deleted.status_code == 404
