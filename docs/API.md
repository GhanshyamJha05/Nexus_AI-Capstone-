# Nexus AI — API Reference

Base URL: `http://localhost:8000/api/v1`

Interactive docs available at `/docs` (development only).

All endpoints (except auth) require `Authorization: Bearer <access_token>` header.

---

## Authentication

### POST /auth/register
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "myusername",
  "full_name": "Jane Smith",
  "password": "SecurePass1"
}
```

**Response 201:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "myusername",
  "full_name": "Jane Smith",
  "is_active": true,
  "is_admin": false
}
```

---

### POST /auth/login
Authenticate and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### POST /auth/refresh
Refresh an access token.

**Request:**
```json
{ "refresh_token": "eyJhbGci..." }
```

---

## Users

### GET /users/me
Returns the current authenticated user.

### PATCH /users/me
Update profile fields.

**Request:**
```json
{
  "full_name": "Jane Doe",
  "avatar_url": "https://example.com/avatar.png"
}
```

### POST /users/me/api-keys
Save personal Gemini API key.

**Request:**
```json
{ "gemini_api_key": "AIzaSy..." }
```

### POST /users/me/change-password
Change password.

---

## Simulations

### POST /simulations
Create and launch a new simulation.

**Request:**
```json
{
  "prompt": "What happens if Apple shifts 50% of manufacturing from China to India?",
  "title": "Apple Manufacturing Shift",
  "tags": ["apple", "supply-chain"],
  "domain": "supply_chain"
}
```

**Response 201:** `SimulationDetail` object

The simulation runs asynchronously. Use WebSocket or poll `GET /simulations/{id}` for updates.

---

### GET /simulations
List simulations with pagination and filtering.

**Query params:**
- `skip` (int, default 0)
- `limit` (int, default 20, max 100)
- `status` (pending|running|completed|failed|cancelled)
- `search` (string, searches title)

**Response:**
```json
{
  "items": [...],
  "total": 42,
  "skip": 0,
  "limit": 20
}
```

---

### GET /simulations/{id}
Get full simulation detail including agent outputs, consensus, causal graph, and reports.

---

### DELETE /simulations/{id}
Delete a simulation (cascades to agent outputs and reports).

---

### POST /simulations/{id}/duplicate
Duplicate a simulation and re-run it.

---

### POST /simulations/{id}/retry
Retry a failed simulation.

---

## Reports

### POST /reports/simulations/{id}/reports
Generate an executive JSON report for a completed simulation.

### GET /reports/simulations/{id}/reports/{report_id}/pdf
Download a PDF version of the report.

---

## WebSocket

### WS /api/v1/ws/simulations/{id}
Connect for real-time agent updates.

**Authentication:** Send token as first message:
```json
{ "token": "eyJhbGci..." }
```

**Messages received:**
```json
{
  "simulation_id": 1,
  "agent_role": "economist",
  "status": "thinking",
  "data": {}
}
```

```json
{
  "simulation_id": 1,
  "agent_role": "economist",
  "status": "complete",
  "data": {
    "confidence": 0.78,
    "summary": "The economic impact involves..."
  }
}
```

---

## Health

### GET /health
Basic health check. No auth required.

### GET /health/ready
Readiness check — verifies DB and Redis connectivity.

---

## Error Responses

All errors follow this format:
```json
{
  "detail": "Human-readable error message"
}
```

| Status | Meaning |
|---|---|
| 400 | Bad request (validation error) |
| 401 | Missing or invalid token |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 422 | Unprocessable entity (schema validation) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
