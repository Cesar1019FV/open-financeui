# Authentication

The API uses JWT Bearer tokens. Every endpoint under `/api/v1/` (except `/api/v1/auth/register` and `/api/v1/auth/login`) requires authentication.

## How it works

1. Register an account.
2. Login with email and password.
3. Receive an `access_token`.
4. Send the token in every subsequent request:

```http
Authorization: Bearer <access_token>
```

## Register

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secret123"
  }'
```

Response:

```json
{
  "id": "...",
  "email": "user@example.com"
}
```

Registering also creates the default income/expense categories for that user.

## Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com" \
  -d "password=secret123"
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

## Get current user

```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

## Token expiration

Tokens expire after the number of days configured by `access_token_expire_days` (default: 7). The frontend should handle 401 responses by redirecting to the login screen.

## Security notes

- Passwords are hashed with bcrypt.
- JWTs are signed with HS256 using the `SECRET_KEY` setting.
- In production, generate a long random `SECRET_KEY` and store it in `.env`.
