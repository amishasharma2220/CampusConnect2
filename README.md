# CampusConnect

> A full-stack university event management platform built for Manipal University Jaipur.

**Live Demo:** [campus-connect2-alpha.vercel.app](https://campus-connect2-alpha.vercel.app)  
**API Docs:** [campusconnect-api-p6ql.onrender.com/api/docs](https://campusconnect-api-p6ql.onrender.com/api/docs)

---

## What is CampusConnect?

CampusConnect replaces the fragmented WhatsApp groups, Instagram pages, and word-of-mouth that MUJ students rely on for event discovery. It gives students, club admins, and university administrators a single platform to discover, organize, and manage every campus event.

---

## Features

**Students**
- Browse and search all campus events by category, date, and club
- Register for events with real-time capacity tracking
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
- Platform-wide analytics — events by category, clubs by faculty
- Browse all 82 active clubs across 5 faculties
- View all registered students with event participation data
- Full events table with status and approval filters

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| Database | PostgreSQL 15 (Neon cloud) |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT — access + refresh tokens with rotation |
| Maps | Google Maps JavaScript API |
| Deployment | Vercel (frontend) · Render (backend) · Neon (database) |

---

## Architecture

```text
┌──────────────────────────────────────────────┐
│                  Frontend                    │
│        React + Vite + TypeScript             │
│              Tailwind CSS                    │
│                  Vercel                      │
└──────────────────────┬───────────────────────┘
                       │
                 HTTPS / REST API
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                  Backend                     │
│                   FastAPI                    │
│          JWT Authentication + RBAC           │
│              SQLAlchemy ORM                  │
│                   Render                     │
└──────────────────────┬───────────────────────┘
                       │
                       │ SQL
                       ▼
┌──────────────────────────────────────────────┐
│                 PostgreSQL                   │
│                    Neon                      │
│                                              │
│          22 Tables • Triggers • RLS          │
└──────────────────────────────────────────────┘

---

## Project Structure

```text
CampusConnect2/
│
├── frontend/                         # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/                    # Application route pages
│   │   ├── components/               # Reusable UI components
│   │   ├── contexts/                 # Global React contexts
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # API client and utilities
│   │   └── main.tsx                  # Application entry point
│   │
│   ├── .env.local                    # Local frontend environment variables
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                          # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── routes/           # REST API endpoints
│   │   │           ├── auth.py
│   │   │           ├── events.py
│   │   │           ├── clubs.py
│   │   │           ├── club_admin.py
│   │   │           └── admin.py
│   │   │
│   │   ├── models/                   # SQLAlchemy database models
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── services/                 # Business logic
│   │   └── core/                     # Configuration and security
│   │       ├── config.py
│   │       └── security.py
│   │
│   ├── requirements.txt
│   └── main.py                       # FastAPI application entry point
│
├── database/
│   ├── schema.sql                    # PostgreSQL database schema
│   ├── seeds.sql                     # Event and calendar seed data
│   └── seed_clubs.py                 # Club seed script
│
├── docs/
│   ├── architecture.md               # System architecture
│   └── api.md                        # API documentation
│
├── .env.example                      # Environment variable template
├── .gitignore
├── CHANGELOG.md
└── README.md
---

## Database Schema

22 tables covering the full platform:

| Domain | Tables |
|--------|--------|
| Auth | `users`, `sessions`, `email_verifications`, `password_resets` |
| Profiles | `profiles` |
| Clubs | `clubs`, `club_members` |
| Events | `events`, `event_proposals`, `event_registrations`, `event_winners`, `attendance`, `certificates` |
| Finance | `club_budget` |
| Campus | `venues`, `academic_calendar`, `leaderboard_points` |
| Future | `marketplace_listings`, `marketplace_messages`, `lost_found_items`, `payments`, `notifications` |

---

## API Routes

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET /api/v1/auth/me

GET /api/v1/events/
POST /api/v1/events/
GET /api/v1/events/{slug}
POST /api/v1/events/{slug}/register
GET /api/v1/events/{slug}/registrations
GET /api/v1/events/admin/proposals
POST /api/v1/events/admin/proposals/{id}/review

GET /api/v1/clubs/
GET /api/v1/clubs/{slug}
GET /api/v1/clubs/{slug}/members
PATCH /api/v1/clubs/{slug}

GET /api/v1/club-admin/my-club
GET /api/v1/club-admin/stats
GET /api/v1/club-admin/events
GET /api/v1/club-admin/completed-events
GET /api/v1/club-admin/members
GET /api/v1/club-admin/budget
POST /api/v1/club-admin/budget
GET /api/v1/club-admin/attendance

GET /api/v1/admin/stats
GET /api/v1/admin/events
GET /api/v1/admin/students
GET /api/v1/admin/clubs


---

## Local Development

```bash
# 1. Clone
git clone https://github.com/amishasharma2220/CampusConnect2.git
cd CampusConnect2

# 2. Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# create .env with DATABASE_URL and JWT_SECRET_KEY
uvicorn app.main:app --reload

# 3. Frontend
cd frontend
npm install
# create .env.local with VITE_API_BASE_URL
npm run dev
```

---

## Seed Data

```bash
# Run schema on your PostgreSQL instance
psql your-db-url < database/schema.sql

# Seed 82 real MUJ clubs
cd backend && python3 ../database/seed_clubs.py

# Seed real campus events
psql your-db-url < database/seeds.sql
```

---

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Root: `frontend/`, Build: `npm run build` |
| Backend | Render | Root: `backend/`, Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Database | Neon | PostgreSQL 15, ap-south-1 |

---

## Author

**Amisha Sharma**  
B.Tech CSE · Manipal University Jaipur  
[LinkedIn](https://linkedin.com/in/amisha-sharma-53a5a2270) · [GitHub](https://github.com/amishasharma2220)
