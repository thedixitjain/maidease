# 🏡 MaidEase

> **Trusted Home Services at Your Fingertips.**  
> A full-stack marketplace connecting homeowners with verified professional maids for cleaning, cooking, and household tasks.

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Supabase)-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/DevOps-Docker-2496ED?style=flat-square&logo=docker)

---

## 🌟 Overview

MaidEase is a modern, two-sided marketplace designed to bring trust and transparency to the gig economy for household services.

*   **For Customers:** Discover top-rated maids, view transparent pricing, book slots instantly, and pay securely.
*   **For Service Providers:** Manage a professional profile, control availability, and track earnings.

Built with a focus on **User Experience (UX)**, featuring a clean, accessible interface and a seamless booking wizard.

## ✨ Key Features

### 🛒 Customer Experience
*   **Smart Discovery**: Filter professionals by rating, experience, and hourly rate.
*   **Seamless Booking Wizard**: A guided 3-step flow (Service → Schedule → Confirm) to reduce friction.
*   **Dashboard Control**: Track booking status (Pending, Accepted, Completed) in real-time.
*   **Verified Reviews**: Read honest feedback from other community members.

### 💼 Provider Experience
*   **Professional Profile**: Showcase skills, bio, and availability like a digital CV.
*   **Job Management**: Accept or decline booking requests with one tap.
*   **Earnings & Stats**: Quick view of completed jobs and current rating.

## 🛠️ Tech Stack

*   **Frontend**: React 18, Vite, CSS Modules (Custom Design System), Axios
*   **Backend**: Python 3.11, FastAPI, SQLAlchemy, Pydantic
*   **Database**: PostgreSQL (hosted on **Supabase**)
*   **Authentication**: JWT (Access + Refresh Tokens) with secure cookie/storage handling
*   **Deployment**: 
    *   Frontend: **Vercel**
    *   Backend: **Render**

## 🚀 Getting Started

### Prerequisites
*   Docker Desktop (Recommended)
*   OR Python 3.11+ & Node.js 18+

### Option A: Quick Start with Docker (Recommended)

Run the entire stack (Database + Backend + Frontend*) with one command:

```bash
cd docker
docker compose up --build
```

*   **Backend API**: `http://localhost:8000`
*   **API Docs**: `http://localhost:8000/docs`
*   **Frontend**: `http://localhost:5173` (Running locally via Vite)

### Option B: Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### 3. Environment Variables
Rename `env.example` to `.env` in both folders and add your credentials (Supabase URL, Secret Keys).

## 📂 Project Structure

```bash
maidease/
├── backend/            # FastAPI Application
│   ├── app/
│   │   ├── api/        # REST Endpoints (v1)
│   │   ├── core/       # Config & Security
│   │   ├── models/     # SQLAlchemy Database Models
│   │   ├── schemas/    # Pydantic Response/Request Models
│   │   └── services/   # Business Logic Layer
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── contexts/   # Auth Context
│   │   ├── pages/      # Application Routes
│   │   └── styles/     # Modern CSS Design System
├── database/           # SQL Init & Seed Scripts
└── docker/             # Docker Compose Configuration
```

## 📸 Screen Previews

> *Add screenshots of your Landing Page, Booking Wizard, and Dashboard here.*

---

Made with ❤️ by [Dixit Jain](https://github.com/thedixitjain)
