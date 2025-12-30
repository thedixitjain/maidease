# MaidEase

Trusted home services marketplace connecting customers with verified professional maids. Built as a full-stack project with a focus on clarity, trust, and smooth booking flows.

## 🎯 Demo Access

Try MaidEase instantly without signing up:

| Role | Email | Password |
|------|-------|----------|
| Customer | demo.customer@maidease.com | DemoPass123 |
| Service Provider | demo.maid@maidease.com | DemoPass123 |

Or use the **one-click demo login** buttons on the login page!

## Overview
- Two-sided platform: customers discover and book; providers manage profiles and availability.
- Modern UX: guided booking wizard, clean dashboards, and role-based flows.
- Cloud-ready: Supabase (PostgreSQL) for data, FastAPI for the backend, React/Vite for the frontend.
- Production-ready: Supports 1000+ concurrent users with connection pooling and rate limiting.

## Tech Stack
- Frontend: React 19, Vite, custom CSS design system, Axios
- Backend: FastAPI, Python 3.11, SQLAlchemy, Pydantic, Gunicorn
- Database: PostgreSQL (Supabase) with optimized connection pooling
- Auth: JWT (access + refresh tokens) with Argon2 password hashing
- Security: Rate limiting, CORS, request timing middleware
- Deployment targets: Vercel (frontend), Render (backend)

## Architecture
- `frontend/` – React SPA (role-aware routes, booking wizard, profile/dashboards)
- `backend/` – FastAPI service (auth, maids, bookings, reviews), SQLAlchemy models
- `database/` – SQL seed/init scripts with optimized indexes
- `docker/` – Dockerfiles and compose for local DB + backend

## Running Locally

### Option A: Docker (recommended for DB + backend)
```bash
cd docker
docker compose up --build
# Backend: http://localhost:8000  (docs at /docs)
```
Run frontend in another shell:
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
# Frontend: http://127.0.0.1:5173
```

### Option B: Manual (no Docker)
Backend:
```bash
cd backend
python -m venv venv
venv\\Scripts\\activate   # Windows (or source venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Frontend:
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

### Environment
- `backend/.env` (see `env.example`): `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`
- `frontend/.env.local`: `VITE_API_URL` (e.g., `http://127.0.0.1:8000/api/v1`)

## Core Features
- Customer: browse/filter maids, guided booking wizard (service → schedule → confirm), booking history, reviews.
- Provider: professional profile, availability/earnings view, accept/reject bookings.
- Shared: JWT auth with refresh, role-based routes, responsive UI.
- Demo Mode: One-click demo login for recruiters and potential users.

## Scalability Features (v2.0)
- **Connection Pooling**: Optimized for 1000+ concurrent users (20 base + 40 overflow connections)
- **Rate Limiting**: 100 requests per minute per client with sliding window algorithm
- **Request Timing**: Performance monitoring with slow request logging
- **Health Monitoring**: `/health` and `/metrics` endpoints for observability
- **Database Indexes**: Optimized queries for common access patterns

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with credentials
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/demo/credentials` - Get demo account info
- `POST /api/v1/auth/demo/login?role=customer|maid` - Quick demo login

### Monitoring
- `GET /health` - Health check with pool status
- `GET /metrics` - Rate limiter and pool statistics

## Notes for Deployment
- Set Render env vars: `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `DEMO_PASSWORD`
- Set Vercel env var: `VITE_API_URL` pointing to the Render backend `/api/v1`
- Demo accounts are auto-created on startup when `DEMO_ENABLED=True`

---
Author: Dixit Jain
