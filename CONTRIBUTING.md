# Contributing to Lead Management System

## Getting Started

### 1. Clone Both Repositories

```bash
# Frontend
git clone https://github.com/sudip-bhr/Lead_Management_System.git

# Backend
git clone https://github.com/sudip-bhr/Lead_Management_System_Backend.git
```

### 2. Set Up Environment Variables

Both projects require environment configuration. **Never commit real `.env` files.**

```bash
# Backend
cd Lead_Management_System_Backend/backend
cp .env.example .env
# Fill in all values — see comments in .env.example for guidance

# Frontend
cd ../../Lead_Management_System/frontend
cp .env.example .env
# Set VITE_API_URL to your backend URL (default: http://localhost:4000/api)
```

### 3. Install & Run

```bash
# Terminal 1 — Backend
cd Lead_Management_System_Backend/backend
npm install
npm run db:migrate   # First time only: creates tables + seeds admin user
npm run dev          # Starts on port 4000

# Terminal 2 — Frontend
cd Lead_Management_System/frontend
npm install
npm run dev          # Starts on port 5173
```

### 4. Default Login

After running migrations, an admin account is seeded:
- **Email**: See `ADMIN_INITIAL_EMAIL` in your `.env`
- **Password**: See `ADMIN_INITIAL_PASSWORD` in your `.env`

> ⚠️ Change the admin password immediately in production.

---

## Project Conventions

### File Naming

| Type | Convention | Example |
|---|---|---|
| React Components | `PascalCase.jsx` | `ChatWidget.jsx` |
| JS Modules | `camelCase.js` | `authStore.js` |
| Routes | `<domain>.routes.js` | `leads.routes.js` |
| Controllers | `<domain>.controller.js` | `leads.controller.js` |
| Services | `<domain>.service.js` | `embedding.service.js` |
| Migrations | `NNN_description.sql` | `006_sprint3_additions.sql` |

### Git Commit Messages

Use the format: `<type>: <description>`

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code restructuring
- `chore:` Build, tooling, or config changes

### Database Migrations

- Migration files live in `backend/src/migrations/`
- Files are numbered sequentially: `001_`, `002_`, etc.
- Each number **must be unique** — never reuse a prefix
- Run all migrations: `npm run db:migrate`

---

## Architecture Overview

```
┌─────────────┐     HTTP/REST     ┌──────────────────┐     SQL      ┌───────────┐
│   Frontend   │ ──────────────▶  │   Backend API     │ ──────────▶ │ PostgreSQL │
│  (React/Vite)│                  │  (Express/Node)   │             │ (Supabase) │
└─────────────┘                  └──────────────────┘             └───────────┘
                                        │
                                        ├── Gemini API (chat responses)
                                        ├── Cohere API (text embeddings)
                                        └── WhatsApp Cloud API (messaging)
```

## Need Help?

- Check the backend [README](https://github.com/sudip-bhr/Lead_Management_System_Backend/blob/main/backend/README.md)
- Check the frontend [README](https://github.com/sudip-bhr/Lead_Management_System/blob/main/README.md)
