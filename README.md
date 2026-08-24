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
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                  React 18 · Vite · TypeScript               │
│                       Tailwind CSS                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTPS REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│                    FastAPI · Python 3.11                    │
│                                                             │
│     JWT Authentication · RBAC · SQLAlchemy ORM             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         DATABASE                            │
│                    PostgreSQL 15 · Neon                     │
│                                                             │
│                 22 Tables · Triggers · Indexes               │
└─────────────────────────────────────────────────────────────┘
Deployment:
Vercel → Frontend
Render → Backend
Neon → PostgreSQL
                                                                                                          
```

## Project Structure

```text
CampusConnect/
│
├── frontend/                         # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/                    # All route pages
│   │   ├── components/               # Reusable UI components
│   │   ├── contexts/                 # Authentication context (JWT)
│   │   ├── hooks/                    # Custom React hooks
│   │   └── lib/                      # API client and utilities
│   │
│   ├── public/                       # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                          # FastAPI application
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── routes/
│   │   │           ├── auth.py       # Authentication routes
│   │   │           ├── events.py     # Event routes
│   │   │           ├── clubs.py      # Club routes
│   │   │           ├── club_admin.py # Club admin routes
│   │   │           └── admin.py      # University admin routes
│   │   │
│   │   ├── models/                   # SQLAlchemy models
│   │   ├── schemas/                  # Pydantic schemas
│   │   ├── services/                 # Business logic
│   │   ├── core/                     # Configuration and security
│   │   └── database/                 # Database configuration
│   │
│   ├── requirements.txt
│   └── ...
│
├── database/
│   ├── schema.sql                    # Complete PostgreSQL schema
│   ├── seeds.sql                     # Event and calendar seed data
│   └── seed_clubs.py                 # Seeds 82 MUJ clubs
│
├── docs/                             # Architecture and API documentation
│
├── README.md
└── ...

```

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

### Authentication

| Method | Endpoint |
|---|---|
| `POST` | `/api/v1/auth/register` |
| `POST` | `/api/v1/auth/login` |
| `POST` | `/api/v1/auth/refresh` |
| `POST` | `/api/v1/auth/logout` |
| `GET` | `/api/v1/auth/me` |

### Events

| Method | Endpoint |
|---|---|
| `GET` | `/api/v1/events/` |
| `POST` | `/api/v1/events/` |
| `GET` | `/api/v1/events/{slug}` |
| `POST` | `/api/v1/events/{slug}/register` |
| `GET` | `/api/v1/events/{slug}/registrations` |
| `GET` | `/api/v1/events/admin/proposals` |
| `POST` | `/api/v1/events/admin/proposals/{id}/review` |

### Clubs

| Method | Endpoint |
|---|---|
| `GET` | `/api/v1/clubs/` |
| `GET` | `/api/v1/clubs/{slug}` |
| `GET` | `/api/v1/clubs/{slug}/members` |
| `PATCH` | `/api/v1/clubs/{slug}` |

### Club Admin

| Method | Endpoint |
|---|---|
| `GET` | `/api/v1/club-admin/my-club` |
| `GET` | `/api/v1/club-admin/stats` |
| `GET` | `/api/v1/club-admin/events` |
| `GET` | `/api/v1/club-admin/completed-events` |
| `GET` | `/api/v1/club-admin/members` |
| `GET` | `/api/v1/club-admin/budget` |
| `POST` | `/api/v1/club-admin/budget` |
| `GET` | `/api/v1/club-admin/attendance` |

### University Admin

| Method | Endpoint |
|---|---|
| `GET` | `/api/v1/admin/stats` |
| `GET` | `/api/v1/admin/events` |
| `GET` | `/api/v1/admin/students` |
| `GET` | `/api/v1/admin/clubs` |

---

---

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/amishasharma2220/CampusConnect2.git
cd CampusConnect2

```

### 2. Backend:

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

```

### 3. Frontend
```bash

cd frontend
npm install
npm run dev

```

### Create backend/.env:
```bash
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET_KEY=your-secret-key

```


### Create frontend/.env.local:
```bash

VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GOOGLE_MAPS_KEY=your-google-maps-key
```

---
### Seed Data
```bash
psql your-db-url < database/schema.sql
cd backend && python3 ../database/seed_clubs.py
psql your-db-url < database/seeds.sql
```

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Root: `frontend/` · Build: `npm run build` |
| Backend | Render | Root: `backend/` · Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Database | Neon | PostgreSQL 15, ap-south-1 |

---

## Author

**Amisha Sharma**  
B.Tech CSE · Manipal University Jaipur  
[LinkedIn](https://linkedin.com/in/amisha-sharma-53a5a2270) · [GitHub](https://github.com/amishasharma2220)
