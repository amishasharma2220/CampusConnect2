# Changelog

All notable changes to CampusConnect. Dates are when the change was merged to `main`.

## 2026-11-25 — AI assistant
- **Ask CampusConnect**: a chat assistant in the web app built on Google Gemini function calling. It answers from live data through four read-only tools (`search_events`, `get_event`, `search_clubs`, `my_registrations`) and a built-in FAQ.
- Only approved events are visible to it, and a student can only see their own registrations; no personal data is sent to Gemini.
- Per-user rate limits (10 per 5 minutes, 50 per day) and a site-wide daily cap on Gemini calls to stay inside the free tier.
- 37 new tests (103 in total). API errors with validation details now show a readable message in the web app.

## 2026-10-18 — README refresh
- README rewritten with web app screenshots, a role flow diagram, test coverage by area, the club admin request API and an honest roadmap.

## 2026-10-09 — Android app
- **Mobile app** (`mobile/`): React Native + Expo student app with sign in/up, secure token storage, event browsing and registration, clubs, Razorpay club membership in a WebView, and club admin requests.
- Android APK built with EAS Build.
- `frontend/vercel.json` rewrites so deep links work on Vercel.

## 2026-09-28 — Club admin requests
- Students can ask to run a club (club, leadership position, message) and track the request.
- University admins approve or reject from a new **Club Admin Requests** tab; approval makes the student the club's admin and closes rival requests for the same club.
- Migration `0004` adds `club_admin_requests` with a partial unique index (one pending request per student).
- Role changes go through a shared `services/roles.py`.

## 2026-09-28 — Security hardening
- Signup is student-only and limited to `@muj.manipal.edu`; the client can no longer choose a role (privilege escalation fix).
- University admins only via the `make_admin` CLI; the API can grant club admin only.
- Access tokens carry a `type` claim, so refresh tokens are rejected on protected routes; disabled accounts are locked out everywhere.
- Rate limits on login (per IP and per email), registration and refresh.
- CORS allowlist and security headers (CSP, X-Frame-Options, nosniff, HSTS in production). Switched to PyJWT.

## 2026-09-27 — Observability
- Structured JSON logs with request IDs (`X-Request-ID`), clean JSON 500s, Sentry error reporting without personal data.
- `/health` and `/health/ready` (database check, 503 when down); both accept HEAD for uptime monitors. UptimeRobot monitoring.

## 2026-09-27 — Razorpay club payments
- Real club membership payments in Razorpay test mode: server-side fee lookup, Orders API, HMAC-SHA256 signature verification, idempotent verify, payment and membership saved in one transaction.

## 2026-09-27 — Code quality
- ruff, ESLint (zero warnings) and TypeScript checks in CI and pre-commit hooks.
- Fixed enum values being stored by name (crashed event winner and team pages), naive datetimes and 23 hidden TypeScript errors.

## 2026-09-26 — Tests and migrations
- pytest suite against real PostgreSQL with per-test rollback, plus coverage reporting.
- Alembic: baseline migration adopting the existing schema, an index on `event_winners.event_id`, and a seed of the 82 MUJ clubs; `alembic check` in CI.

## 2026-09-18 — Docker and CI/CD
- Multi-stage, non-root Dockerfile with a health check; docker-compose with a seeded local PostgreSQL.
- GitHub Actions for backend and frontend CI; deploys to Render only after CI passes.

## 2026-07 — First version
- FastAPI backend with auth (JWT + refresh tokens), events, clubs, club admin and university admin APIs over 22 PostgreSQL tables.
- React + Vite + TypeScript frontend: landing page, events, student and club admin dashboards, event approval flow and the clubs directory.
