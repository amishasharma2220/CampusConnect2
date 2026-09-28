# CampusConnect

> A full-stack university event management platform built for Manipal University Jaipur, with a production-grade engineering setup: containerised, tested, continuously deployed, monitored and security-hardened.

[![Backend CI](https://github.com/amishasharma2220/CampusConnect2/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/amishasharma2220/CampusConnect2/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/amishasharma2220/CampusConnect2/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/amishasharma2220/CampusConnect2/actions/workflows/frontend-ci.yml)
![Python](https://img.shields.io/badge/python-3.11-blue)
![Tests](https://img.shields.io/badge/tests-66%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-87%25-brightgreen)

**Live Demo:** [campus-connect2-alpha.vercel.app](https://campus-connect2-alpha.vercel.app)  
**API Docs:** [campusconnect-api-p6ql.onrender.com/api/docs](https://campusconnect-api-p6ql.onrender.com/api/docs)  
**Health:** [campusconnect-api-p6ql.onrender.com/health/ready](https://campusconnect-api-p6ql.onrender.com/health/ready)

> The API runs on Render's free tier; if it has been idle, the first request can take up to a minute.

---

## What is CampusConnect?

CampusConnect replaces the fragmented WhatsApp groups, Instagram pages, and word-of-mouth that MUJ students rely on for event discovery. It gives students, club admins, and university administrators a single platform to discover, organize, and manage every campus event.

---

## Features

**Students**
- Browse and search all campus events by category, date, and club
- Register for events with real-time capacity tracking
- Join clubs and pay the membership fee through **Razorpay** (server-verified payments)
- View registered events and certificates on personal dashboard
- Campus leaderboard based on event participation
- Venue finder with live Google Maps integration for all campus locations

**Club Admins**
- Create events — submitted for university admin approval before going live
- Manage registrations, track attendance, and mark event completion
- Record winners and issue certificates for completed events
- Budget and finance tracking (inflows, outflows, net balance per event)
- Team structure management with role hierarchy (President → Core Members)

**University Admin**
- Review and approve or reject event proposals from club admins
- Grant the club admin role to students (roles are granted, never self-selected)
- Platform-wide analytics — events by category, clubs by faculty
- Browse all 82 active clubs across 5 faculties
- View all registered students with event participation data
- Full events table with status and approval filters

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11, Pydantic v2 |
| Database | PostgreSQL 15 (Neon), SQLAlchemy 2.0, Alembic migrations |
| Auth | JWT (PyJWT) access + refresh tokens with rotation, bcrypt |
| Payments | Razorpay Orders API + HMAC-SHA256 signature verification |
| Testing | pytest, pytest-cov, real PostgreSQL with per-test transaction rollback |
| CI/CD | GitHub Actions, Docker, pre-commit (ruff, ESLint) |
| Observability | Structured JSON logs with request IDs, Sentry, UptimeRobot |
| Deployment | Vercel (frontend) · Render (backend) · Neon (database) |

---

## Architecture

```mermaid
flowchart LR
    U[Browser] -->|HTTPS| V[Vercel<br/>React + Vite]
    V -->|REST /api/v1<br/>JWT| R[Render<br/>FastAPI in Docker]
    R -->|SQLAlchemy| N[(Neon<br/>PostgreSQL 15)]
    R -->|Orders + signature check| P[Razorpay]
    R -->|errors| S[Sentry]
    M[UptimeRobot] -->|/health/ready every 5 min| R
    G[GitHub Actions<br/>lint · test · migration check] -->|deploy hook when main is green| R
```

---

## Engineering

### Containers — Docker
- **Multi-stage Dockerfile**: wheels are built in a builder stage, the runtime image contains no compilers, runs as a non-root user and has a built-in `HEALTHCHECK`.
- **docker-compose** brings up the API plus a local PostgreSQL that seeds itself from `database/schema.sql` and `seeds.sql` on first start.

### CI/CD — GitHub Actions
- **Backend CI**: ruff lint → `alembic upgrade head` on a fresh PostgreSQL service → `alembic check` (fails if a model changed without a migration) → pytest with coverage.
- **Frontend CI**: ESLint with zero warnings allowed → `tsc` typecheck → production build.
- **Deploy**: pushes to `main` trigger the Render deploy hook **only after both CI jobs pass**; Vercel deploys the frontend.

### Testing
- **66 pytest tests, 87% coverage**, run against a real PostgreSQL database (not SQLite), so PostgreSQL enums, UUIDs and constraints behave exactly as in production.
- Each test runs inside a transaction that is rolled back afterwards, so tests never leave data behind and can run against a seeded dev database.
- Covers auth, events, admin, payments (with signatures computed exactly as Razorpay does), security rules and observability.

### Database migrations — Alembic
- A **baseline migration** adopts the existing production schema without touching data; every schema change since is a versioned migration.
- Migrations run automatically on every deploy (`alembic upgrade head` before the server starts).
- Autogenerate is tuned so it never proposes dropping foreign keys or converting `CITEXT` emails to `VARCHAR`.

### Code quality
- **ruff** (pycodestyle, pyflakes, isort, pyupgrade, bugbear, naive-datetime checks), **ESLint** and **TypeScript** checks, all enforced in CI and in **pre-commit hooks**.
- Found and fixed real bugs along the way: enum values stored by name (which crashed event-winner pages), naive UTC datetimes, and 23 hidden TypeScript errors.

### Observability
- **Structured JSON logs** in production: one line per request with method, path, status, duration and a **request ID**, which is also returned in the `X-Request-ID` header.
- Unhandled errors return a clean JSON 500 containing the request ID (no stack traces leak to clients) and are reported to **Sentry**, tagged with the request ID and deployed commit; no personal data is sent.
- **Health checks**: `/health` (liveness) and `/health/ready` (checks the database, returns 503 if unreachable), used by Render and an **UptimeRobot** monitor.

### Security
- **Signup** is student-only and restricted to `@muj.manipal.edu` addresses, enforced on the server; admin roles can only be granted by a university admin (or, for university admins, a CLI script).
- **Tokens**: routes accept access tokens only (a refresh token can't be used as an access token), and disabled accounts are rejected everywhere.
- **Rate limiting** on login, registration and token refresh (429 + `Retry-After`).
- **CORS allowlist** (the production site and localhost only) and **security headers** (CSP, `X-Frame-Options`, `nosniff`, HSTS in production).
- **Payments**: the fee comes from the database, never the browser; a membership is created only after the Razorpay HMAC signature is verified; verification is idempotent.
- Dependencies audited with `pip-audit` (no known vulnerabilities).

---

## Project Structure

```text
CampusConnect/
├── .github/workflows/               # backend-ci, frontend-ci, deploy
├── docker-compose.yml               # API + local PostgreSQL
├── .pre-commit-config.yaml          # ruff, ESLint, hygiene hooks
│
├── frontend/                        # React + Vite + TypeScript
│   └── src/
│       ├── pages/                   # All route pages (incl. Razorpay checkout)
│       ├── components/              # Reusable UI components
│       ├── contexts/ · hooks/       # Auth context and hooks
│       └── lib/                     # API client and utilities
│
├── backend/                         # FastAPI application
│   ├── Dockerfile                   # Multi-stage, non-root, healthcheck
│   ├── alembic/                     # Migrations (baseline + versions)
│   ├── app/
│   │   ├── api/                     # Routes, health checks, shared deps
│   │   ├── core/                    # Config, security, logging, rate limits, headers, Sentry
│   │   ├── models/ · schemas/       # SQLAlchemy models, Pydantic schemas
│   │   ├── services/                # Business logic (auth, Razorpay client)
│   │   └── scripts/                 # make_admin CLI
│   ├── tests/                       # pytest suite
│   └── requirements.txt
│
└── database/
    ├── schema.sql                   # Original schema (baseline for Alembic)
    └── seeds.sql                    # Local dev seed data
```

---

## Database Schema

22 tables covering the full platform:

| Domain | Tables |
|--------|--------|
| Auth | `users`, `sessions`, `email_verifications`, `password_resets` |
| Profiles | `profiles` |
| Clubs | `clubs`, `club_members` |
| Events | `events`, `event_proposals`, `event_registrations`, `event_winners`, `attendance`, `certificates` |
| Finance | `club_budget`, `payments` |
| Campus | `venues`, `academic_calendar`, `leaderboard_points` |
| Future | `marketplace_listings`, `marketplace_messages`, `lost_found_items`, `notifications` |

---

## API Routes

Full interactive docs: [`/api/docs`](https://campusconnect-api-p6ql.onrender.com/api/docs)

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` · `GET /auth/me` |
| Events | `GET/POST /events/` · `GET /events/{slug}` · `POST /events/{slug}/register` · `GET /events/{slug}/registrations` · `GET /events/admin/proposals` · `POST /events/admin/proposals/{id}/review` |
| Clubs | `GET /clubs/` · `GET/PATCH /clubs/{slug}` · `GET /clubs/{slug}/members` · `GET /clubs/{slug}/events` |
| Club Admin | `GET /club-admin/my-club` · `/stats` · `/events` · `/completed-events` · `/members` · `GET/POST /club-admin/budget` · `GET /club-admin/attendance` |
| University Admin | `GET /admin/stats` · `/events` · `/students` · `/clubs` · `PATCH /admin/users/{id}/role` |
| Payments | `POST /payments/club-membership/order` · `POST /payments/verify` |
| Health | `GET /health` · `GET /health/ready` (outside `/api/v1`) |

All routes above are under `/api/v1` unless noted.

---

## Local Development

### Option A — Docker (API + database in one command)

```bash
git clone https://github.com/amishasharma2220/CampusConnect2.git
cd CampusConnect2
cat > backend/.env <<'ENV'
DATABASE_URL=postgresql://campusconnect:campusconnect_local_pw@localhost:5432/campusconnect
JWT_SECRET_KEY=change-me-to-a-long-random-string-at-least-32-chars
ENV
docker compose up --build        # API on http://localhost:8000, Postgres seeded automatically
```

### Option B — Run the backend directly

```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head             # creates the schema and seeds the 82 clubs
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

`frontend/.env.local`:
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GOOGLE_MAPS_KEY=your-google-maps-key
```

Optional backend settings (Razorpay, Sentry, CORS, logging) are documented in [`.env.example`](.env.example); add only the ones you need to `backend/.env`.

### Tests and checks

```bash
cd backend && pytest --cov=app          # needs a PostgreSQL DATABASE_URL (docker compose up -d db)
cd frontend && npm run lint && npm run typecheck
pre-commit install                      # run ruff + ESLint on every commit
```

### Create a university admin

```bash
cd backend && python -m app.scripts.make_admin you@muj.manipal.edu
```

---

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Root: `frontend/` · Build: `npm run build` |
| Backend | Render | Root: `backend/` · Start: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT` · Health check: `/health/ready` |
| Database | Neon | PostgreSQL 15, ap-south-1 |
| Monitoring | Sentry · UptimeRobot | Errors and uptime alerts |

---

## Author

**Amisha Sharma**  
B.Tech CSE · Manipal University Jaipur  
[LinkedIn](https://linkedin.com/in/amisha-sharma-53a5a2270) · [GitHub](https://github.com/amishasharma2220)
