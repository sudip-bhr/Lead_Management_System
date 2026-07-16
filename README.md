# Lead Management System

A full-stack CRM and lead management platform for educational institutions. Built with **React** (frontend) and **Node.js/Express** (backend), powered by **Supabase/PostgreSQL**.

## Features

- **Lead Pipeline** — Kanban board with drag-and-drop lead management
- **AI Chatbot** — Embeddable chat widget with RAG-powered responses (Gemini + Cohere embeddings)
- **Knowledge Base** — Upload documents to train the chatbot
- **Analytics Dashboard** — Visual reporting with Recharts
- **Bootcamp Management** — Create and manage educational programs
- **WhatsApp Integration** — Receive and route leads from WhatsApp
- **Role-Based Access** — Admin and counselor roles with scoped views
- **Follow-Up Scheduling** — Automated reminders and activity logging

## Repository Structure

This repository contains the **frontend** application. The backend lives in a [separate repository](https://github.com/sudip-bhr/Lead_Management_System_Backend).

```
Lead_Management_System/
├── frontend/              ← React/Vite SPA
│   ├── src/
│   │   ├── components/    ← Feature-grouped UI components
│   │   ├── pages/         ← Route-level page components
│   │   ├── layouts/       ← App shell and auth guards
│   │   ├── store/         ← Zustand state management
│   │   ├── lib/           ← Axios client and utilities
│   │   └── embed/         ← Standalone chatbot embed entry
│   ├── public/            ← Static assets
│   └── vite.config.js     ← Main build config
└── README.md
```

## Quick Start

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A running instance of the [backend API](https://github.com/sudip-bhr/Lead_Management_System_Backend)

### Setup

```bash
# Clone
git clone https://github.com/sudip-bhr/Lead_Management_System.git
cd Lead_Management_System/frontend

# Configure environment
cp .env.example .env
# Edit .env with your backend API URL

# Install & run
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
# Production build
npm run build

# Embeddable chat widget build
npm run build:embed
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Routing | React Router 7 |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |
| HTTP | Axios |
| Linting | Oxlint |

## Related

- [Backend Repository](https://github.com/sudip-bhr/Lead_Management_System_Backend)
