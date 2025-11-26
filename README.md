# 🏠 MaidEase

**MaidEase** is a full-stack web application that connects customers with professional maids for household services. The platform enables users to browse available maids, book services, manage bookings, and leave reviews.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Contributing](#-contributing)

---

## ✨ Features

### For Customers
- 🔐 **User Authentication** - Secure registration and login with JWT tokens
- 🔍 **Browse Maids** - View available maids with ratings, experience, and hourly rates
- 📅 **Book Services** - Schedule maid services with preferred date and time
- ⭐ **Review System** - Rate and review maids after service completion
- 📊 **Booking Management** - Track all bookings and their statuses

### For Maids
- 👤 **Profile Management** - Create and update professional profiles
- 📋 **Booking Requests** - View and manage incoming booking requests
- ✅ **Accept/Reject Bookings** - Control your schedule and availability
- 💰 **Earnings Tracking** - Monitor completed bookings and earnings

### Platform Features
- 🔒 **Secure Authentication** - JWT-based authentication with refresh tokens
- 🌐 **RESTful API** - Well-documented API endpoints
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🗄️ **PostgreSQL Database** - Reliable data storage with Supabase
- 🚀 **Cloud Deployment** - Backend on Render, Frontend on Vercel

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast Python web framework
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Supabase)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) - Database toolkit and ORM
- **Authentication**: JWT tokens with [python-jose](https://github.com/mpdavis/python-jose)
- **Password Hashing**: [Argon2](https://argon2-cffi.readthedocs.io/) - Secure password hashing
- **Validation**: [Pydantic](https://docs.pydantic.dev/) - Data validation using Python type annotations
- **Server**: [Uvicorn](https://www.uvicorn.org/) + [Gunicorn](https://gunicorn.org/)

### Frontend
- **Framework**: [React](https://react.dev/) 19.2.0
- **Build Tool**: [Vite](https://vitejs.dev/) - Next generation frontend tooling
- **Routing**: [React Router](https://reactrouter.com/) v6
- **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client
- **State Management**: React Context API

### DevOps & Deployment
- **Backend Hosting**: [Render](https://render.com/)
- **Frontend Hosting**: [Vercel](https://vercel.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Version Control**: Git

---

## 📁 Project Structure

```
maidease/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── deps.py        # Dependency injection utilities
│   │   │   └── v1/            # API version 1 endpoints
│   │   ├── core/              # Core functionality
│   │   │   ├── config.py      # Configuration settings
│   │   │   ├── security.py    # JWT and password utilities
│   │   │   └── exceptions.py  # Custom exceptions
│   │   ├── models/            # SQLAlchemy database models
│   │   │   ├── user.py        # User model
│   │   │   ├── booking.py     # Booking model
│   │   │   ├── review.py      # Review model
│   │   │   └── service.py     # Service model
│   │   ├── schemas/           # Pydantic validation schemas
│   │   │   ├── user.py        # User schemas
│   │   │   ├── booking.py     # Booking schemas
│   │   │   ├── review.py      # Review schemas
│   │   │   └── token.py       # Token schemas
│   │   ├── services/          # Business logic layer
│   │   │   ├── auth_service.py      # Authentication logic
│   │   │   ├── user_service.py      # User management
│   │   │   ├── booking_service.py   # Booking operations
│   │   │   ├── maid_service.py      # Maid listing logic
│   │   │   └── review_service.py    # Review management
│   │   ├── utils/             # Utility functions
│   │   ├── database.py        # Database connection setup
│   │   ├── main.py            # FastAPI application entry point
│   │   └── config.py          # App configuration
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Unit and integration tests
│   ├── requirements.txt       # Python dependencies
│   ├── render.yaml            # Render deployment config
│   └── .env                   # Environment variables (not in git)
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── api/               # API client configuration
│   │   │   ├── client.js      # Axios instance with interceptors
│   │   │   └── endpoints.js   # API endpoint definitions
│   │   ├── components/        # Reusable React components
│   │   ├── contexts/          # React Context providers
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── pages/             # Page components
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # React entry point
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.js         # Vite configuration
│   └── vercel.json            # Vercel deployment config
│
├── database/                   # Database scripts and schemas
└── docker/                     # Docker configuration (optional)
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.9 or higher
- **Node.js** 18 or higher
- **PostgreSQL** database (or Supabase account)
- **Git**

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create a `.env` file** in the `backend` directory with the following variables:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=15
   REFRESH_TOKEN_EXPIRE_DAYS=7
   CORS_ORIGINS=http://localhost:5173,https://your-frontend-url.vercel.app
   ```

6. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

7. **Start the development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   
   API documentation (Swagger UI) will be at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the `frontend` directory (if needed):
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:8000/api/v1`
- **Production**: `https://maidease-api.onrender.com/api/v1`

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "phone_number": "9876543210",
  "role": "customer"  // or "maid"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=SecurePass123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer {refresh_token}
```

### User Endpoints

#### Get Current User
```http
GET /users/me
Authorization: Bearer {access_token}
```

#### Update User Profile
```http
PUT /users/{user_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "full_name": "Updated Name",
  "bio": "Professional maid with 10 years experience",
  "hourly_rate": 500.0
}
```

### Maid Endpoints

#### Get All Maids
```http
GET /maids
```

#### Get Maid Details
```http
GET /maids/{maid_id}
```

### Booking Endpoints

#### Create Booking
```http
POST /bookings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "maid_id": "uuid-here",
  "service_type": "house_cleaning",
  "booking_date": "2025-11-20T14:00:00",
  "time_slot": "14:00",
  "total_amount": 500.0,
  "notes": "Please bring cleaning supplies"
}
```

#### Get User Bookings
```http
GET /bookings
Authorization: Bearer {access_token}
```

#### Update Booking Status
```http
PUT /bookings/{booking_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "accepted"  // or "completed", "canceled"
}
```

### Review Endpoints

#### Create Review
```http
POST /reviews
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "booking_id": "uuid-here",
  "rating": 5,
  "comment": "Excellent service!"
}
```

#### Get Maid Reviews
```http
GET /reviews/maid/{maid_id}
```

For complete API documentation, visit the Swagger UI at `/docs` when running the backend server.

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | JWT signing secret | `your-secret-key-min-32-chars` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiry | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | `7` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,https://app.vercel.app` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |

---

## 🧪 Testing

### Backend Tests

Run the test suite:
```bash
cd backend
pytest
```

Run with coverage:
```bash
pytest --cov=app tests/
```

### Frontend Tests

```bash
cd frontend
npm run test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Development Team** - Initial work

---

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- React team for the amazing frontend library
- Supabase for reliable database hosting
- Render and Vercel for seamless deployment

---

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ by the MaidEase Team**
