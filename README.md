<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />

<br /><br />

# HelpDesk SaaS

**A full-stack support ticketing system — inspired by Jira & ServiceNow**

*Create tickets · Assign to staff · Track status · Comment in real-time*

</div>

---

## Overview

HelpDesk is a production-ready support ticketing platform built as a portfolio project. It features a clean **Jira-like UI**, a RESTful API with **role-based access control**, and a PostgreSQL database with proper schema design — the kind of stack you'd find in a real SaaS product.

## Features

| | Feature |
|--|---------|
| **Auth** | Register & login with bcrypt password hashing + JWT |
| **Roles** | `user` submits tickets · `admin` manages everything |
| **Tickets** | Create with title, description, and 4-level priority |
| **Status workflow** | `open` → `in-progress` → `resolved` → `closed` |
| **Assignment** | Admins assign tickets to any staff member |
| **Comments** | Threaded conversation on every ticket |
| **Admin dashboard** | Stats (by status & priority) + full user management |
| **Responsive UI** | Dark sidebar layout, color-coded badges, clean tables |

## Tech Stack

```
Frontend          Backend           Database          Infrastructure
─────────         ────────          ────────          ──────────────
React 18          Node.js           PostgreSQL 16     Docker Compose
Vite              Express 4         pg (node-postgres) 
Tailwind CSS      JWT auth
React Router 6    bcryptjs
Axios             CORS
```

## Getting Started

### Prerequisites
- **Node.js** 18+
- **Docker** (for the database) — or a local PostgreSQL instance

### 1 — Clone the repo

```bash
git clone https://github.com/KirilShy/helpdesk-saas.git
cd helpdesk-saas
```

### 2 — Start the database

```bash
docker-compose up -d db
```

This spins up PostgreSQL on port `5432` and auto-runs the schema migrations.

### 3 — Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/helpdesk
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

```bash
npm install
npm run dev    # → http://localhost:4000
```

### 4 — Frontend

```bash
cd ../frontend
npm install
npm run dev    # → http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173), register an account, and start creating tickets.

> **Tip:** Register one account as `Admin` and one as `User` to see both sides of the app.

---

## Project Structure

```
helpdesk-saas/
├── docker-compose.yml
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js                 # Express entry point
│       ├── config/
│       │   └── db.js                # PostgreSQL connection pool
│       ├── db/
│       │   └── schema.sql           # Tables + updated_at trigger
│       ├── middleware/
│       │   ├── auth.js              # JWT verification
│       │   └── requireRole.js       # Role-based guard
│       └── routes/
│           ├── auth.js              # POST /register  /login
│           ├── tickets.js           # CRUD + status/assign
│           ├── comments.js          # GET/POST /:id/comments
│           └── admin.js             # GET /users  /stats
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                  # Routes + guards
        ├── main.jsx
        ├── index.css                # Tailwind + custom components
        ├── api/
        │   └── client.js            # Axios instance + interceptors
        ├── context/
        │   └── AuthContext.jsx      # Global auth state
        ├── components/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx
        │   ├── StatusBadge.jsx
        │   └── PriorityBadge.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx        # Ticket list + stat cards
            ├── CreateTicket.jsx
            ├── TicketDetail.jsx     # Comments + admin controls
            └── AdminPanel.jsx       # Stats + user management
```

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register a new user |
| `POST` | `/api/auth/login` | — | Login, returns JWT |

### Tickets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/tickets` | User | List tickets (admin sees all, user sees own) |
| `POST` | `/api/tickets` | User | Create a new ticket |
| `GET` | `/api/tickets/:id` | User | Get a single ticket |
| `PATCH` | `/api/tickets/:id/status` | Admin | Update status |
| `PATCH` | `/api/tickets/:id/assign` | Admin | Assign to a staff member |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/tickets/:id/comments` | User | List comments |
| `POST` | `/api/tickets/:id/comments` | User | Add a comment |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/users` | Admin | List all users |
| `GET` | `/api/admin/stats` | Admin | Ticket counts by status & priority |

## Database Schema

```sql
users     id · name · email · password_hash · role · created_at
tickets   id · title · description · priority · status · created_by → users · assigned_to → users · created_at · updated_at
comments  id · ticket_id → tickets · user_id → users · body · created_at
```

An `updated_at` trigger on the `tickets` table keeps timestamps accurate automatically.

## Deployment

### Render (free tier)

1. Push to GitHub
2. Create a **PostgreSQL** database on Render — copy the connection string
3. Deploy **backend** as a Web Service
   - Build: `npm install` · Start: `npm start`
   - Env vars: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`
4. Deploy **frontend** as a Static Site
   - Build: `npm run build` · Publish dir: `dist`

### AWS (EC2 + RDS)

1. Provision an RDS PostgreSQL instance
2. Launch an EC2 instance, clone the repo, configure env vars
3. Run backend with `pm2`
4. Serve frontend build with Nginx

---

<div align="center">

Built by [Kiril Shynkarenko](https://github.com/KirilShy) · Portfolio project

</div>
