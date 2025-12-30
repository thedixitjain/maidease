# MaidEase

A modern, production-ready home services marketplace connecting customers with trusted cleaning professionals. Built with a focus on scalability, security, and seamless user experience.

**[Live Demo](https://maidease-thedixitjain.vercel.app)** · **[API Docs](https://maidease-api.onrender.com/docs)**

---

## Quick Start

| Role | Email | Password |
|------|-------|----------|
| Customer | `demo.customer@maidease.com` | `DemoPass123` |
| Provider | `demo.maid@maidease.com` | `DemoPass123` |

Or use the one-click demo buttons on the login page.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  FRONTEND                                    │
│                            (Vercel - React SPA)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Pages     │  │ Components  │  │  Contexts   │  │     API     │        │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤        │
│  │ Login       │  │ Header      │  │ AuthContext │  │ Axios       │        │
│  │ Register    │  │ Footer      │  │             │  │ Interceptors│        │
│  │ Dashboard   │  │ DemoBanner  │  │             │  │ Token Mgmt  │        │
│  │ MaidsList   │  │ Protected   │  │             │  │             │        │
│  │ BookingForm │  │ Route       │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS / REST API
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  BACKEND                                     │
│                          (Render - FastAPI + Gunicorn)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                           MIDDLEWARE LAYER                            │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  CORS  │  Rate Limiter (100 req/min)  │  Request Timing  │  Logging  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                            API LAYER (v1)                             │  │
│  ├────────────┬────────────┬────────────┬────────────┬─────────────────┤  │
│  │   /auth    │  /users    │  /maids    │ /bookings  │    /reviews     │  │
│  │  register  │  profile   │   list     │   create   │     create      │  │
│  │   login    │  update    │  details   │   status   │    by maid      │  │
│  │  refresh   │            │            │    list    │                 │  │
│  │   demo     │            │            │            │                 │  │
│  └────────────┴────────────┴────────────┴────────────┴─────────────────┘  │
│                                      │                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          SERVICE LAYER                                │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  AuthService  │  UserService  │  BookingService  │  DemoService     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          SECURITY LAYER                               │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  JWT (Access + Refresh)  │  Argon2 Hashing  │  OAuth2 Bearer        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                           DATA LAYER                                  │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  SQLAlchemy ORM  │  Connection Pool (20+40)  │  Pydantic Schemas    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ PostgreSQL Protocol (SSL)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 DATABASE                                     │
│                            (Supabase - PostgreSQL)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │     users       │  │    bookings     │  │     reviews     │            │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤            │
│  │ id (UUID)       │  │ id (UUID)       │  │ id (UUID)       │            │
│  │ email           │  │ customer_id  ───┼──│ booking_id   ───┤            │
│  │ hashed_password │  │ maid_id      ───┼──│ customer_id     │            │
│  │ full_name       │  │ service_type    │  │ maid_id         │            │
│  │ role (enum)     │  │ booking_date    │  │ rating          │            │
│  │ is_active       │  │ status (enum)   │  │ comment         │            │
│  │ [maid fields]   │  │ total_amount    │  │ created_at      │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│  Indexes: email, role, status, booking_date, customer_id, maid_id          │
│  Triggers: auto-update updated_at timestamps                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router, Axios |
| Backend | FastAPI, Python 3.11, Gunicorn, Uvicorn |
| Database | PostgreSQL (Supabase) |
| ORM | SQLAlchemy 2.0, Alembic |
| Auth | JWT (python-jose), Argon2 (passlib) |
| Validation | Pydantic v2 |
| Deployment | Vercel (FE), Render (BE) |

---

## Project Structure

```
maidease/
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios client, endpoints
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React Context (Auth)
│   │   ├── pages/         # Route pages
│   │   ├── styles/        # CSS modules
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/v1/        # Route handlers
│   │   ├── core/          # Config, security, rate limiter
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── database.py    # DB connection & pooling
│   │   └── main.py        # FastAPI app
│   └── requirements.txt
│
├── database/
│   ├── init.sql           # Schema + indexes
│   └── seed.sql           # Sample data
│
└── docker/
    ├── docker-compose.yml
    └── Dockerfile.*
```

---

## Key Features

**For Customers:**
- Browse and filter service providers
- View detailed profiles with ratings
- Guided booking wizard (service → schedule → confirm)
- Booking history and status tracking
- Leave reviews for completed services

**For Service Providers:**
- Professional profile management
- Availability and earnings dashboard
- Accept/reject booking requests
- View customer reviews

**Platform:**
- Role-based access control
- JWT authentication with refresh tokens
- Demo mode for instant access
- Rate limiting (100 req/min)
- Connection pooling for 1000+ concurrent users

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create new account |
| POST | `/api/v1/auth/login` | Get access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/demo/login` | Quick demo access |
| GET | `/api/v1/users/me` | Current user profile |
| PUT | `/api/v1/users/me` | Update profile |
| GET | `/api/v1/maids` | List providers |
| GET | `/api/v1/maids/{id}` | Provider details |
| POST | `/api/v1/bookings` | Create booking |
| GET | `/api/v1/bookings/my-bookings` | User's bookings |
| PUT | `/api/v1/bookings/{id}` | Update status |
| POST | `/api/v1/reviews` | Create review |
| GET | `/api/v1/reviews/maid/{id}` | Provider reviews |
| GET | `/health` | Health check |
| GET | `/metrics` | Pool & rate limit stats |

---

## Local Development

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Environment Variables:**

Backend (`.env`):
```
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:5173
DEMO_ENABLED=True
```

Frontend (`.env.local`):
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Deployment

- **Frontend:** Auto-deploys to Vercel on push to `main`
- **Backend:** Auto-deploys to Render on push to `main`
- **Database:** Hosted on Supabase (PostgreSQL)

---

## Author

**Dixit Jain**

- GitHub: [@thedixitjain](https://github.com/thedixitjain)
- Email: dixitjain@jklu.edu.in
