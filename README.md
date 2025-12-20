# MaidEase

Trusted home services marketplace connecting customers with verified professional maids. Built as a full-stack project with a focus on clarity, trust, and smooth booking flows.

## Overview
- Two-sided platform: customers discover and book; providers manage profiles and availability.
- Modern UX: guided booking wizard, clean dashboards, and role-based flows.
- Cloud-ready: Supabase (PostgreSQL) for data, FastAPI for the backend, React/Vite for the frontend.

## Tech Stack
- Frontend: React 18, Vite, custom CSS design system, Axios
- Backend: FastAPI, Python 3.11, SQLAlchemy, Pydantic
- Database: PostgreSQL (Supabase)
- Auth: JWT (access + refresh tokens)
- Deployment targets: Vercel (frontend), Render (backend)

## Architecture
- `frontend/` – React SPA (role-aware routes, booking wizard, profile/dashboards)
- `backend/` – FastAPI service (auth, maids, bookings, reviews), SQLAlchemy models
- `database/` – SQL seed/init scripts
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

## Notes for Deployment
- Set Render env vars: `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS` (include your Vercel URL and localhost).
- Set Vercel env var: `VITE_API_URL` pointing to the Render backend `/api/v1`.

---
Author: Dixit Jain
