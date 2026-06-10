# DevMesh AI

An AI-powered collaboration network for developers — real-time team chat, AI teammate & cofounder matching, a startup idea board, and a Developer Trust Score that surfaces talent for recruiters.

## Features

- **Real-time chat** — DM and team rooms with typing indicators, read receipts, emoji reactions, message edit/delete, and per-conversation clear
- **AI Matching** — skill-based teammate and cofounder matching powered by OpenAI (heuristic fallback when no key is set)
- **Teams** — create teams, invite members, jump straight to team group chat
- **Connections** — send/accept/decline connection requests; open DMs from the connections page
- **Developer Trust Score** — 0–100 composite score from profile, GitHub, certs, projects, and activity; surfaced on profiles and the Recruiter dashboard
- **Recruiter dashboard** — filter, sort, and shortlist candidates by trust score
- **Startups board** — post and browse startup ideas
- **Onboarding** — guided multi-step profile setup (skills, projects, certificates auto-saved)

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router v6, Tailwind CSS, Framer Motion, Zustand, Socket.io-client |
| Backend | Node.js, Express, Socket.io, MongoDB (Mongoose), JWT, Zod, Stripe, Cloudinary |
| Auth | Firebase Authentication (Google sign-in) + custom JWT session |
| AI | FastAPI, OpenAI, LangChain |

## Monorepo Layout

```
devmesh-ai/
├── src/                 # Frontend — Vite + React + TypeScript
├── server/              # Backend — Express + Socket.io + Mongoose
└── ai-service/          # AI microservice — FastAPI
```

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Firebase project with Google Auth enabled

### 1. Frontend

```bash
npm install
cp .env.example .env.local     # fill in your values
npm run dev                    # http://localhost:5173
```

Minimum `.env.local` for local dev with a real backend:

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

> Without the backend vars, chat runs in demo mode (simulated peer, no persistence).

### 2. Backend

```bash
cd server
npm install
cp .env.example .env           # fill in your values (see below)
npm run dev                    # http://localhost:4000
```

### 3. AI Service (optional)

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Without `OPENAI_API_KEY` it uses deterministic heuristics — matching and trust scoring still work.

---

## Environment Variables

### Frontend (`src/` — `.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST base URL e.g. `https://your-api.onrender.com/api` |
| `VITE_SOCKET_URL` | Backend WebSocket URL e.g. `https://your-api.onrender.com` |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

### Backend (`server/` — `.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default `4000`) |
| `CLIENT_ORIGIN` | Frontend URL for CORS e.g. `https://your-app.vercel.app` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random 64-char string for signing tokens |
| `JWT_EXPIRES` | Token TTL e.g. `7d` |
| `FIREBASE_PROJECT_ID` | From Firebase service account JSON |
| `FIREBASE_CLIENT_EMAIL` | From Firebase service account JSON |
| `FIREBASE_PRIVATE_KEY` | From Firebase service account JSON (`\n` escaped) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLOUDINARY_URL` | Cloudinary connection string |
| `OPENAI_API_KEY` | OpenAI API key (optional) |
| `AI_SERVICE_URL` | URL of the FastAPI AI service |

#### Getting Firebase env vars

1. Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key** → download the JSON
3. Copy these three fields into your env:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep `\n` as literal `\n` — the app converts them)

> **Security:** never commit `firebase-service-account.json`. It is in `.gitignore`. Rotate your Firebase private key if it was ever committed to version control.

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step Render (backend) + Vercel (frontend) setup.

---

## Real-time Chat Architecture

The `Conversation` + `Message` model handles history. Socket.io handles live delivery.

- `socket.to(roomId)` broadcasts to all room members **except** the sender — the sender's optimistic message is already in the UI, preventing double renders
- DB-assigned message IDs deduplicate reconnect replays
- JWT handshake authenticates the WebSocket connection
- Typing indicators, presence, and read receipts are in-memory (Redis adapter needed for multi-instance — see DEPLOYMENT.md)

Socket events: `join_room`, `send_message`, `receive_message`, `typing_start`, `typing_stop`, `user_online`, `user_offline`, `message_seen`

## Developer Trust Score

Server-side weighted composite (0–100), recomputed on every profile change:

| Signal | Weight |
|---|---|
| Profile completeness | 20% |
| GitHub activity | 25% |
| Certificates | 20% |
| Projects | 25% |
| Platform activity | 10% |

Tiers: Beginner (0–24) · Intermediate (25–49) · Advanced (50–74) · Expert (75–100)
