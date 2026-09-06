# Mini Kanban Board — Full-Stack Engineering Challenge

A full-stack Mini Kanban Board application built for the **Webbriks Technical Assessment**. Supports workspace boards, custom columns, tasks, drag-and-drop movement, and strict collaboration/access control.

---

## 🚀 Tech Stack

- **Backend**: [NestJS](https://nestjs.com/) (TypeScript), [Prisma ORM](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/), Passport JWT Auth, Swagger OpenAPI.
- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router, TypeScript), [Tailwind CSS](https://tailwindcss.com/), [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) (Drag-and-Drop), Lucide Icons.
- **DevOps**: Docker, Docker Compose, Multi-stage Dockerfiles.

---

## 🌟 Key Features

### 1. Authentication & Access Control
- **JWT Token Authentication**: Secure registration and login with bcrypt password hashing.
- **Role-Based Collaboration**:
  - `OWNER`: Full control (edit/delete board, add/remove columns, manage tasks, invite/remove members).
  - `EDITOR`: Manage columns and tasks, invite new members.
  - `VIEWER`: Read-only access to board and tasks.
- **Unauthorized Cross-Board Prevention**: Strictly rejects operations when attempting to move tasks across boards or modify resources without access permissions.

### 2. Workflow Management & Task Movement
- **Complete CRUD**: Full management for Boards, Columns, and Tasks.
- **Atomic Task Movement API** (`PATCH /api/tasks/:id/move`):
  - Reorders tasks within the same column or across columns.
  - Automatically calculates stable floating positions with automated integer rebalancing when precision thresholds are reached.
  - Runs in an atomic database transaction (`$transaction`) guaranteeing zero duplicate positions and preventing race conditions.

### 3. Modern Interactive Frontend
- **Drag-and-Drop Board View**: Interactive fluid card movement between columns with optimistic UI feedback.
- **Task Attributes**: Priority tags (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), descriptions, assignee attribution, and timestamps.
- **Search & Filter**: Real-time task search and priority filters.
- **Collaborator Modal**: Invite team members by email and assign roles on the fly.

---

## 📦 Project Structure

```
Webbriks_Technical_Assessment/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module, JWT strategy & guards
│   │   ├── boards/        # Boards CRUD, sharing, and role checks
│   │   ├── columns/       # Columns CRUD and order management
│   │   ├── tasks/         # Tasks CRUD & atomic movement engine
│   │   ├── prisma/        # Prisma service & module
│   │   ├── app.module.ts
│   │   └── main.ts        # Bootstrap with CORS & Swagger docs (/api/docs)
│   ├── prisma/
│   │   ├── schema.prisma  # PostgreSQL schema definitions
│   │   └── seed.ts        # Database seed script
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/               # Next.js App Router (login, register, dashboard, boards/[id])
│   ├── components/        # KanbanColumn, TaskCard, TaskModal, ShareModal, Navbar
│   ├── context/           # AuthContext & state provider
│   ├── lib/               # Typed Axios API client & models
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Spin up Postgres, Backend, and Frontend in one command
├── .env.example
└── README.md
```

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- PostgreSQL or Docker

### Option A: Running with Docker (Recommended)

To spin up the PostgreSQL database, NestJS backend, and Next.js frontend with a single command:

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

### Option B: Running Locally

#### 1. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Make sure PostgreSQL is running, then run Prisma schema push and seed
npx prisma db push
npx tsx prisma/seed.ts

# Start the NestJS backend
npm run start:dev
```
Backend will start on [http://localhost:4000](http://localhost:4000).

#### 2. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Frontend will start on [http://localhost:3000](http://localhost:3000).

---

## 🔑 Pre-seeded Demo Accounts

You can immediately sign in with any of the seeded test accounts:

| Email | Password | Role in Demo Board |
|---|---|---|
| `alex@example.com` | `password123` | **Owner** (Full control) |
| `sarah@example.com` | `password123` | **Editor** (Can create & move tasks) |
| `john@example.com` | `password123` | **Viewer** (Read-only view) |

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive Bearer JWT |
| `GET` | `/api/auth/me` | Get profile of logged-in user |
| `GET` | `/api/boards` | List user's owned and shared boards |
| `POST` | `/api/boards` | Create a board with default columns |
| `GET` | `/api/boards/:id` | Get board columns and tasks |
| `POST` | `/api/boards/:id/members` | Share board with another user |
| `DELETE` | `/api/boards/:id/members/:userId` | Revoke member access |
| `POST` | `/api/boards/:id/columns` | Create a new column |
| `PATCH` | `/api/columns/:id` | Rename or reorder column |
| `DELETE` | `/api/columns/:id` | Delete a column |
| `POST` | `/api/columns/:id/tasks` | Create a task in a column |
| `PATCH` | `/api/tasks/:id` | Edit task properties |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `PATCH` | `/api/tasks/:id/move` | **Move task within or across columns** |
