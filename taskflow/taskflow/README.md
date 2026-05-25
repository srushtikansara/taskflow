# TaskFlow 🗂️

> A production-ready, full-stack **Task Management** platform built with Next.js, Flask, and Supabase.

![TaskFlow Banner](docs/banner-placeholder.png)

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Architecture](#-architecture)
3. [Tech Stack](#-tech-stack)
4. [Folder Structure](#-folder-structure)
5. [Database Schema](#-database-schema)
6. [API Endpoints](#-api-endpoints)
7. [Setup Instructions](#-setup-instructions)
8. [Environment Variables](#-environment-variables)
9. [Deployment](#-deployment)
10. [Screenshots](#-screenshots)

---

## ✨ Features

| Area | Capabilities |
|------|-------------|
| **Auth** | Google OAuth 2.0, JWT access + refresh tokens, protected routes |
| **Tasks** | Create / Edit / Delete / Archive, priorities, statuses, due dates, tags |
| **Assignments** | Assign tasks to team members, assignment audit trail |
| **Notifications** | In-app bell with unread badge, email on assign & complete |
| **Email** | HTML emails via Gmail SMTP (task assigned, task completed) |
| **Dashboard** | Stat cards, progress bar, overdue alerts, recent tasks |
| **UI/UX** | Sidebar nav, search, filters, loading skeletons, toast notifications |
| **Security** | CORS, rate limiting, input validation, RLS in Supabase |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser / App                          │
│         Next.js 14 (App Router)  ·  Tailwind CSS            │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTPS / REST
┌───────────────────────────▼─────────────────────────────────┐
│               Flask REST API  (Python 3.12)                  │
│  Blueprints: auth · tasks · users · notifications           │
│  JWT auth · CORS · Rate limiting · Input validation         │
└───────────┬───────────────────────────────┬─────────────────┘
            │  Supabase Python SDK          │  Gmail SMTP
┌───────────▼──────────────────┐   ┌────────▼──────────────┐
│  Supabase (PostgreSQL + RLS) │   │  Gmail (App Password) │
│  users · tasks ·             │   │  HTML email templates  │
│  task_assignments ·          │   └────────────────────────┘
│  notifications               │
└──────────────────────────────┘

Deployment:
  Frontend  → Vercel (Edge Network)
  Backend   → Render / Railway (Docker)
  Database  → Supabase (managed Postgres)
```

---

## 🧰 Tech Stack

### Frontend
- **Next.js 14** – App Router, Server + Client Components
- **TypeScript** – end-to-end type safety
- **Tailwind CSS** – utility-first styling
- **Axios** – HTTP client with interceptors + token refresh
- **React Hook Form + Zod** – validated forms
- **react-hot-toast** – toast notifications
- **Lucide React** – icon set

### Backend
- **Flask 3** – lightweight Python web framework
- **Flask-CORS** – cross-origin resource sharing
- **Flask-Limiter** – rate limiting
- **PyJWT** – stateless JWT auth
- **supabase-py** – Supabase client
- **Gunicorn** – production WSGI server

### Database & Auth
- **Supabase** (PostgreSQL) – hosted database with Row Level Security
- **Google OAuth 2.0** – sign-in with Google

---

## 📁 Folder Structure

```
taskflow/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Environment configs
│   │   ├── api/
│   │   │   ├── auth.py          # Google OAuth + JWT
│   │   │   ├── tasks.py         # Task CRUD + assignment
│   │   │   ├── users.py         # User listing
│   │   │   └── notifications.py # Notification management
│   │   ├── services/
│   │   │   └── email_service.py # Gmail SMTP email sender
│   │   └── utils/
│   │       ├── supabase_client.py
│   │       ├── jwt_helper.py
│   │       ├── validators.py
│   │       └── error_handlers.py
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── wsgi.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout + providers
│   │   │   ├── globals.css
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── callback/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx      # Sidebar + auth guard
│   │   │       ├── page.tsx        # Overview dashboard
│   │   │       ├── tasks/
│   │   │       │   ├── page.tsx    # Task list + filters
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       └── notifications/page.tsx
│   │   ├── components/
│   │   │   └── tasks/
│   │   │       └── TaskForm.tsx    # Create / edit form
│   │   ├── hooks/
│   │   │   └── useTasks.ts         # Data-fetching hooks
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios instance
│   │   │   ├── auth-context.tsx    # Auth React context
│   │   │   └── utils.ts            # Helper functions
│   │   ├── services/
│   │   │   ├── tasks.service.ts
│   │   │   └── users.service.ts
│   │   └── types/
│   │       └── index.ts
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── render.yaml          # Render IaC
├── vercel.json          # Vercel config
└── README.md
```

---

## 🗄 Database Schema

```sql
users              (id, email, full_name, avatar_url, google_id, role, is_active, last_login)
tasks              (id, title, description, due_date, priority, status, creator_id → users, assignee_id → users, tags, is_archived, completed_at)
task_assignments   (id, task_id → tasks, assigned_by → users, assigned_to → users, note)
notifications      (id, user_id → users, type, title, message, task_id → tasks, is_read, email_sent)
```

Row Level Security ensures users can only read/write their own data.

---

## 🔌 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/google` | Redirect to Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback → issue JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Current user profile |
| POST | `/api/auth/logout` | Logout (client-side discard) |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List tasks (filters: status, priority, search) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/status` | Quick status update |
| POST | `/api/tasks/:id/assign` | Assign task to user |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List users (search: ?search=) |
| GET | `/api/users/:id` | Get user by ID |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | List notifications + unread count |
| PATCH | `/api/notifications/:id` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- A Supabase project
- A Google Cloud project (OAuth)
- A Gmail account with App Password enabled

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

---

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Copy your **Project URL** and **service role key** from Settings → API
3. In Supabase Dashboard → **SQL Editor** → paste and run `backend/migrations/001_initial_schema.sql`
4. Enable **Row Level Security** is already in the SQL (verify under Table Editor)

---

### 3. Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web application type)
4. Add Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (dev)
   - `https://your-backend.onrender.com/api/auth/google/callback` (prod)
5. Copy **Client ID** and **Client Secret**

---

### 4. Gmail SMTP Setup

1. Go to your Google Account → Security → **2-Step Verification** (enable it)
2. Under Security → **App passwords** → Create an App Password for "Mail"
3. Copy the 16-character password

---

### 5. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your actual values

# Run in development
flask --app wsgi:app run --debug
```

Backend runs at `http://localhost:5000`

---

### 6. Frontend Setup

```bash
cd frontend
npm install

# Copy and fill in environment variables
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000

npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `FLASK_ENV` | `development` or `production` |
| `SECRET_KEY` | Flask secret key |
| `JWT_SECRET_KEY` | JWT signing key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `GMAIL_SENDER` | Gmail address to send from |
| `GMAIL_APP_PASSWORD` | 16-char Gmail App Password |
| `FRONTEND_URL` | Your frontend URL (for redirects) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## 🌐 Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repository
4. Set **Root Directory** to `backend`
5. Build command: `pip install -r requirements.txt`
6. Start command: `gunicorn wsgi:app --workers 2 --bind 0.0.0.0:$PORT`
7. Add all environment variables from `.env.example`
8. Deploy!

Alternatively, use the included `render.yaml` with **Render IaC**.

---

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Or connect your GitHub repo to Vercel:
1. Import project → set **Root Directory** to `frontend`
2. Framework: **Next.js** (auto-detected)
3. Add environment variable: `NEXT_PUBLIC_API_URL` = your Render URL
4. Deploy!

---

## 📸 Screenshots

| Dashboard | Tasks List | Task Detail |
|-----------|-----------|-------------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Tasks](docs/screenshots/tasks.png) | ![Detail](docs/screenshots/detail.png) |

| New Task | Notifications | Login |
|----------|--------------|-------|
| ![New Task](docs/screenshots/new-task.png) | ![Notifications](docs/screenshots/notifications.png) | ![Login](docs/screenshots/login.png) |

> _Screenshots to be added after first deployment._

---

## 🔒 Security Highlights

- **JWT** access tokens (1hr) + refresh tokens (30d)
- **Supabase RLS** – database-level row isolation per user
- **CORS** restricted to allowed origins
- **Rate limiting** – 200/day, 60/hour per IP
- **Input validation** on all POST/PATCH endpoints
- **HTTPS only** in production (Vercel + Render enforce this)
- **Environment variables** – secrets never committed to source

---

## 📝 License

MIT © 2024 TaskFlow
