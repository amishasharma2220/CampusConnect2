<div align="center">

# CampusConnect

**One place for every campus event at Manipal University Jaipur:** discover events, join clubs, pay membership fees and run club activities, on the web and on Android, with an AI assistant that answers from live campus data.

[![Backend CI](https://github.com/amishasharma2220/CampusConnect2/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/amishasharma2220/CampusConnect2/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/amishasharma2220/CampusConnect2/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/amishasharma2220/CampusConnect2/actions/workflows/frontend-ci.yml)
![Python](https://img.shields.io/badge/python-3.11-blue)
![Tests](https://img.shields.io/badge/tests-103%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-89%25-brightgreen)
![Android](https://img.shields.io/badge/android-APK-3DDC84?logo=android&logoColor=white)
![AI](https://img.shields.io/badge/AI%20assistant-Gemini-4285F4?logo=googlegemini&logoColor=white)

[**Live Demo**](https://campus-connect2-alpha.vercel.app) · [**Android APK**](https://expo.dev/accounts/amisha2220/projects/campusconnect/builds/446d32ca-aa6d-4cb5-b35b-7e9c6195d9ed) · [**API Docs**](https://campusconnect-api-p6ql.onrender.com/api/docs) · [**Health**](https://campusconnect-api-p6ql.onrender.com/health/ready)

<img src="docs/screenshots/landing.jpg" alt="CampusConnect landing page" width="100%" />

</div>

> The API runs on Render's free tier; if it has been idle, the first request can take up to a minute.

---

## Contents

[What is CampusConnect?](#what-is-campusconnect) · [Screenshots](#screenshots) · [Features](#features) · [Mobile App](#mobile-app) · [AI Assistant](#ai-assistant) · [How roles work](#how-roles-work) · [Tech Stack](#tech-stack) · [Architecture](#architecture) · [Engineering](#engineering) · [Project Structure](#project-structure) · [Database](#database-schema) · [API](#api-routes) · [Local Development](#local-development) · [Deployment](#deployment) · [Roadmap](#roadmap)

---

## What is CampusConnect?

Event information at MUJ is scattered across WhatsApp groups, Instagram pages and word of mouth. CampusConnect gives the three groups involved one shared platform:

- **Students** find events, register, join clubs and pay membership fees.
- **Club admins** propose events, track registrations, attendance, winners and budgets.
- **University admins** approve events, decide who runs each club and see campus-wide analytics.

It runs as a React web app, an Android app and a FastAPI backend, with an AI assistant built on Google Gemini, automated tests, CI/CD, monitoring and security hardening.

---

## Screenshots

<sub>Web app screenshots from a local run with demo data (names and requests are fictional).</sub>

### For students

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/events.png" alt="Events page" /><br/><sub><b>Browse events</b>: search and filter by category, with live capacity</sub></td>
    <td width="50%"><img src="docs/screenshots/student-dashboard.png" alt="Student dashboard" /><br/><sub><b>Student dashboard</b>: registered events, recommendations and the “Run a club?” request card</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/event-details.png" alt="Event details" /><br/><sub><b>Event details</b>: date, venue, capacity and one-click registration</sub></td>
    <td width="50%" align="center"><img src="docs/screenshots/payment.png" alt="Razorpay checkout" width="80%" /><br/><sub><b>Club membership checkout</b>: the fee comes from the server and is paid through Razorpay</sub></td>
  </tr>
</table>

<img src="docs/screenshots/chat-assistant.png" alt="Ask CampusConnect AI assistant" width="100%" />
<sub><b>Ask CampusConnect</b>: an AI assistant that looks up real events, clubs and the student's own registrations, and links straight to them</sub>

### For club admins

<img src="docs/screenshots/club-dashboard.png" alt="Club admin dashboard" width="100%" />
<sub><b>Club dashboard</b>: events, approvals, registrations, members, plus team, attendance, budget and certificates in the sidebar</sub>

### For university admins

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/admin-overview.png" alt="University admin overview" /><br/><sub><b>Overview</b>: 82 clubs across 5 faculties, events by category</sub></td>
    <td width="50%"><img src="docs/screenshots/admin-club-requests.png" alt="Club admin requests" /><br/><sub><b>Club admin requests</b>: approve or reject students who ask to run a club</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/admin-event-approvals.png" alt="Event approvals" /><br/><sub><b>Event approvals</b>: no event goes live without review</sub></td>
    <td width="50%"><img src="docs/screenshots/login.jpg" alt="Sign in" /><br/><sub><b>Sign in</b>: MUJ email addresses only</sub></td>
  </tr>
</table>

### For developers

<img src="docs/screenshots/api-docs.png" alt="Interactive API docs" width="100%" />
<sub><b>Interactive API docs</b> generated by FastAPI at <a href="https://campusconnect-api-p6ql.onrender.com/api/docs"><code>/api/docs</code></a></sub>

---

## Features

**Students**
- Browse and search all campus events by category, date and club
- Register for events with real-time capacity tracking
- Join clubs and pay the membership fee through **Razorpay** (server-verified payments)
- **Request club admin access** for a club they lead, and track the request status
- View registered events and certificates on a personal dashboard
- Campus leaderboard based on event participation
- Venue finder with Google Maps for all campus locations
- **Ask CampusConnect**, an AI assistant: “What tech events are coming up?”, “Which photography clubs can I join?”, “What am I registered for?”

**Club Admins**
- Create events, which go to a university admin for approval before going live
- Manage registrations, track attendance and mark events as completed
- Record winners and issue certificates for completed events
- Budget and finance tracking (inflows, outflows, net balance per event)
- Team structure management with a role hierarchy (President → Core Members)

**University Admins**
- Approve or reject event proposals from club admins
- **Review club admin requests**: approving makes the student the club's admin in one step
- Change user roles (student ↔ club admin); roles are always granted, never self-selected
- Platform-wide analytics: events by category, clubs by faculty
- Browse all 82 active clubs across 5 faculties and all registered students
- Full events table with status and approval filters

---

## Mobile App

A native **React Native (Expo)** app for students, built on the same FastAPI backend as the web app. Source: [`mobile/`](mobile/).

<p align="center">
  <img src="mobile/docs/screenshots/sign-in.png" width="160" alt="Sign in" />
  <img src="mobile/docs/screenshots/home.png" width="160" alt="Home" />
  <img src="mobile/docs/screenshots/events.png" width="160" alt="Events" />
  <img src="mobile/docs/screenshots/clubs.png" width="160" alt="Clubs" />
  <img src="mobile/docs/screenshots/profile.png" width="160" alt="Profile" />
</p>

- Sign in / sign up with JWT access + refresh tokens stored in the device Keychain/Keystore (`expo-secure-store`), with automatic token refresh
- Home feed with your next registered event, quick stats and upcoming events
- Search and filter events by time and category; event details with live capacity and one-tap registration
- Browse all 82 clubs, view leadership and club events, and **join with Razorpay** (Checkout in a WebView, signature verified server-side)
- Request club admin access and track the request status from your profile
- Read-only club dashboard for club admins

**Try it:** [download the Android APK](https://expo.dev/accounts/amisha2220/projects/campusconnect/builds/446d32ca-aa6d-4cb5-b35b-7e9c6195d9ed), or run it with Expo Go:

```bash
cd mobile
npm install
npx expo start   # scan the QR code with Expo Go
```

---

## AI Assistant

**Ask CampusConnect** is a chat assistant in the web app for logged-in students. It answers from the live database instead of guessing, using **Gemini function calling**:

```mermaid
sequenceDiagram
    participant S as Student
    participant API as FastAPI /chat
    participant G as Gemini
    participant DB as PostgreSQL
    S->>API: "Any tech events this weekend?"
    API->>G: question + system prompt (FAQ) + tool list
    G-->>API: call search_events(category="Tech")
    API->>DB: read-only query (approved events only)
    DB-->>API: events
    API->>G: tool results
    G-->>API: answer with links to /events/...
    API-->>S: reply
```

- **Tools, not database access.** The model can only ask the backend to run four read-only functions: `search_events`, `get_event`, `search_clubs` and `my_registrations`. The backend runs them with the student's own permissions. Pending or rejected events are never returned.
- **No data leaks between students.** `my_registrations` takes no arguments and always uses the logged-in user, so the model can't be talked into reading someone else's data. Emails, phone numbers and registration numbers are never sent to Gemini.
- **Safe output.** Replies are rendered as plain text with a small markdown subset. Only links to pages inside CampusConnect are clickable, and no HTML is ever injected.
- **Stays in the free tier.** Defaults to `gemini-3.5-flash-lite`, with a site-wide daily cap on Gemini calls (`CHAT_DAILY_LIMIT`), plus 10 messages per 5 minutes and 50 per day for each student.
- **Fails gracefully.** With no API key, a Gemini outage or a used-up quota, the chat shows a clear message and the rest of the site is unaffected.
- **Editable knowledge.** How the platform works (registration, fees, becoming a club admin) lives in [`chat_faq.txt`](backend/app/services/chat_faq.txt).

---

## How roles work

Everyone signs up as a **student**: signup is limited to `@muj.manipal.edu` addresses and ignores any role a client sends. Higher roles are only ever granted:

```mermaid
flowchart LR
    S[Sign up with an<br/>@muj.manipal.edu email] --> ST((Student))
    ST -->|"“Run a club?” request<br/>club + position + message"| Q[Pending request]
    Q -->|university admin approves| CA((Club admin<br/>linked to that club))
    Q -->|rejects, with a note| ST
    CLI["make_admin script<br/>(needs database access)"] --> UA((University admin))
    UA -.reviews.-> Q
```

- A student can have **one pending request** at a time (enforced by a partial unique index), and only for a club that has no admin yet.
- Approving re-checks those rules, makes the student a club admin, links them to the club and **automatically rejects other pending requests** for the same club, all in one transaction.
- **University admins can't be created through the API at all**, only with `python -m app.scripts.make_admin`, so no web bug can lead to the highest role.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Radix UI |
| Mobile | React Native 0.86, Expo SDK 57, Expo Router, TypeScript |
| Backend | FastAPI, Python 3.11, Pydantic v2 |
| Database | PostgreSQL 15 (Neon), SQLAlchemy 2.0, Alembic migrations |
| Auth | JWT (PyJWT) access + refresh tokens with rotation, bcrypt |
| Payments | Razorpay Orders API + HMAC-SHA256 signature verification |
| AI | Google Gemini API (function calling), called over REST with httpx |
| Testing | pytest, pytest-cov, real PostgreSQL with per-test transaction rollback |
| CI/CD | GitHub Actions, Docker, pre-commit (ruff, ESLint) |
| Observability | Structured JSON logs with request IDs, Sentry, UptimeRobot |
| Deployment | Vercel (web) · Render (API) · Neon (database) · EAS Build (Android APK) |

---

## Architecture

```mermaid
flowchart LR
    U[Browser] -->|HTTPS| V[Vercel<br/>React + Vite]
    A[Android app<br/>Expo / React Native] -->|REST /api/v1<br/>JWT| R
    V -->|REST /api/v1<br/>JWT| R[Render<br/>FastAPI]
    R -->|SQLAlchemy| N[(Neon<br/>PostgreSQL 15)]
    R -->|Orders + signature check| P[Razorpay]
    R -->|errors| S[Sentry]
    R -->|function calling| GM[Google Gemini]
    M[UptimeRobot] -->|/health every 5 min| R
    G[GitHub Actions<br/>lint · test · migration check] -->|deploy hook only when CI is green| R
```

---

## Engineering

### CI/CD — GitHub Actions
- **Backend CI**: ruff lint → `alembic upgrade head` on a fresh PostgreSQL service → `alembic check` (fails if a model changed without a migration) → pytest with coverage.
- **Frontend CI**: ESLint with zero warnings allowed → `tsc` typecheck → production build.
- **Deploy**: on a push to `main`, the deploy workflow re-runs both CI jobs and calls the Render deploy hook **only if they pass**. Render's own auto-deploy is turned off, so a failing commit can't reach production. Vercel deploys the web app.

### Testing
- **103 pytest tests, 89% coverage**, run against a real PostgreSQL database (not SQLite), so PostgreSQL enums, UUIDs, partial indexes and constraints behave exactly as in production.
- Each test runs inside a transaction that is rolled back afterwards, so tests never leave data behind.

| Area | Tests | Examples |
|---|---|---|
| Security | 17 | can't pick your own role at signup, MUJ-only emails, refresh token ≠ access token, disabled accounts locked out, rate limits, CORS, security headers |
| Observability | 13 | request IDs, access logs, JSON log format, clean 500s, health checks (GET + HEAD), 503 when the database is down |
| AI assistant | 37 | only approved events reach the model, a student only sees their own registrations, bad tool calls don't crash, rate limits and daily cap, Gemini errors and quota, thought signatures kept for multi-step tool use |
| Club admin requests | 10 | one pending request per student, approval links the club and rejects rivals, approval refused if the club got an admin meanwhile |
| Payments | 7 | fee from the database, forged signatures rejected, idempotent verification, can't verify someone else's order |
| Auth · Events · Admin | 15 | login, `/auth/me`, event creation by role, duplicate registration, admin-only stats |
| Regressions | 4 | enum values (winner positions, multi-word roles), token refresh, expired sessions |

### Database migrations — Alembic
- A **baseline migration** adopts the existing production schema without touching data; every schema change since is a versioned migration (4 so far, including the 82-club seed and club admin requests).
- Migrations run automatically on every deploy (`alembic upgrade head` before the server starts).
- Autogenerate is tuned so it never proposes dropping foreign keys or converting `CITEXT` emails to `VARCHAR`.

### Containers — Docker
- **Multi-stage Dockerfile**: wheels are built in a builder stage; the runtime image contains no compilers, runs as a non-root user and has a built-in `HEALTHCHECK`.
- **docker-compose** brings up the API plus a local PostgreSQL that seeds itself from `database/schema.sql` and `seeds.sql` on first start.

### Code quality
- **ruff** (pycodestyle, pyflakes, isort, pyupgrade, bugbear, naive-datetime checks), **ESLint** and **TypeScript** checks, enforced in CI and in **pre-commit hooks**.
- Real bugs found and fixed along the way: enum values stored by name (which crashed the event-winner pages), naive UTC datetimes, and 23 hidden TypeScript errors.

### Observability
- **Structured JSON logs** in production: one line per request with method, path, status, duration and a **request ID**, also returned in the `X-Request-ID` header.
- Unhandled errors return a clean JSON 500 containing the request ID (no stack traces leak to clients) and are reported to **Sentry**, tagged with the request ID and deployed commit, with no personal data.
- **Health checks**: `/health` (liveness, used by Render and pinged by **UptimeRobot** every 5 minutes) and `/health/ready` (checks the database and returns 503 if it's unreachable). Both accept GET and HEAD. Uptime pings go to `/health` because it doesn't touch the database, so the serverless Neon database can scale to zero when nobody is using the site.

### Security
- **Signup** is student-only and restricted to `@muj.manipal.edu`; admin roles are granted by a university admin (club admin) or a CLI script (university admin), never through signup.
- **Tokens**: 30-minute access JWTs and 7-day refresh tokens stored only as SHA-256 hashes, rotated on every refresh; routes reject refresh tokens and disabled accounts.
- **Rate limiting** on login (per IP and per email), registration and token refresh (429 + `Retry-After`).
- **SQL injection**: all queries go through SQLAlchemy's parameterised queries; input is validated by Pydantic first.
- **CORS allowlist** (the production site and localhost only) and **security headers** (CSP, `X-Frame-Options`, `nosniff`, HSTS in production).
- **Payments**: the fee comes from the database, never the browser; a membership is created only after the Razorpay HMAC signature is verified (constant-time comparison), in the same transaction as the payment; verification is idempotent.
- Dependencies audited with `pip-audit`.

---

## Project Structure

```text
CampusConnect2/
├── .github/workflows/               # backend-ci, frontend-ci, deploy
├── docker-compose.yml               # API + local PostgreSQL
├── .pre-commit-config.yaml          # ruff, ESLint, hygiene hooks
├── docs/screenshots/                # README screenshots
│
├── frontend/                        # React + Vite + TypeScript (Vercel)
│   ├── vercel.json                  # SPA rewrites for client-side routing
│   └── src/
│       ├── pages/                   # Route pages (dashboards, events, Razorpay checkout)
│       ├── components/              # UI components (club admin request card, admin panel, chat assistant)
│       ├── contexts/ · hooks/       # Auth context and hooks
│       └── lib/                     # API client and utilities
│
├── mobile/                          # React Native (Expo) student app
│   └── src/
│       ├── app/                     # Expo Router screens (auth, tabs, event, club)
│       ├── components/              # UI kit, cards, Razorpay WebView
│       └── lib/                     # API client, auth context, hooks
│
├── backend/                         # FastAPI application (Render)
│   ├── Dockerfile                   # Multi-stage, non-root, healthcheck
│   ├── alembic/                     # Migrations (baseline + versions)
│   ├── app/
│   │   ├── api/                     # Routes, health checks, shared deps
│   │   ├── core/                    # Config, security, logging, rate limits, headers, Sentry
│   │   ├── models/ · schemas/       # SQLAlchemy models, Pydantic schemas
│   │   ├── services/                # Business logic (auth, roles, Razorpay, Gemini chat assistant + FAQ)
│   │   └── scripts/                 # make_admin CLI
│   ├── tests/                       # pytest suite (103 tests)
│   └── requirements.txt
│
└── database/
    ├── schema.sql                   # Original schema (baseline for Alembic)
    └── seeds.sql                    # Local dev seed data
```

---

## Database Schema

23 tables covering the full platform:

| Domain | Tables |
|--------|--------|
| Auth | `users`, `sessions`, `email_verifications`, `password_resets` |
| Profiles | `profiles` |
| Clubs | `clubs`, `club_members`, `club_admin_requests` |
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
| Club admin requests | `GET /club-admin-requests/positions` · `POST /club-admin-requests` · `GET /club-admin-requests/mine` · `GET /admin/club-admin-requests` · `POST /admin/club-admin-requests/{id}/review` |
| Club Admin | `GET /club-admin/my-club` · `/stats` · `/events` · `/completed-events` · `/members` · `GET/POST /club-admin/budget` · `GET /club-admin/attendance` |
| University Admin | `GET /admin/stats` · `/events` · `/students` · `/clubs` · `PATCH /admin/users/{id}/role` |
| Payments | `POST /payments/club-membership/order` · `POST /payments/verify` |
| AI assistant | `POST /chat` |
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
# create backend/.env with DATABASE_URL and JWT_SECRET_KEY (as above)
alembic upgrade head             # creates the schema and seeds the 82 clubs
uvicorn app.main:app --reload
```

### Web app

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

### Mobile app

```bash
cd mobile
npm install
npx expo start                   # scan the QR code with Expo Go
```

Optional backend settings (Gemini, Razorpay, Sentry, CORS, logging) are documented in [`.env.example`](.env.example); add only the ones you need to `backend/.env` (unknown keys are rejected on startup). To try the AI assistant locally, add `GEMINI_API_KEY` (free from [Google AI Studio](https://aistudio.google.com/apikey)); without it the chat replies that it isn't set up.

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
| Web | Vercel | Root: `frontend/` · Build: `npm run build` · SPA rewrites in `vercel.json` |
| API | Render | Root: `backend/` · Start: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT` · Health check: `/health` · Auto-deploy off (deployed by GitHub Actions after CI) |
| Mobile | EAS Build | Root: `mobile/` · `npx eas-cli build --platform android --profile preview` |
| Database | Neon | PostgreSQL, AWS us-east-2, scales to zero when idle |
| AI | Google Gemini | `GEMINI_API_KEY` set as a Render environment variable (never in code) |
| Monitoring | Sentry · UptimeRobot | Errors and uptime alerts (`/health`) |

---

## Roadmap

Known limitations and what's next:

- [ ] Move the refresh token into an httpOnly cookie (the web app keeps tokens in `localStorage` today)
- [ ] Razorpay **webhooks**, so a membership is confirmed even if the user closes the tab right after paying
- [ ] Shared rate limiting in Redis (the current limiter is per server instance)
- [ ] Email verification and password reset flows (the tables already exist)
- [ ] Frontend tests (Vitest, React Testing Library) and end-to-end tests (Playwright)
- [ ] Fix N+1 queries on list endpoints and move remaining route logic into services
- [ ] AI assistant: stream replies as they're written, and add it to the mobile app

---

## Author

**Amisha Sharma**  
B.Tech CSE · Manipal University Jaipur  
[LinkedIn](https://linkedin.com/in/amishasharma2220) · [GitHub](https://github.com/amishasharma2220)
