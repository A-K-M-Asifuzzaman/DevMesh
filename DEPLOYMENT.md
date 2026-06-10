# Deployment Guide

Render (backend) + Vercel (frontend) + MongoDB Atlas + Firebase

---

## Before You Deploy — Credentials Checklist

1. **Rotate any credentials that were ever in version control** (MongoDB URI, OpenAI key, Firebase private key)
2. Ensure `firebase-service-account.json` is NOT committed (it is in `.gitignore`)
3. Have the following accounts ready:
   - MongoDB Atlas
   - Firebase (Google Auth enabled)
   - Render
   - Vercel
   - Cloudinary (for file uploads)
   - Stripe (for billing, optional to start)

---

## Step 1 — MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. In **Network Access**, allow `0.0.0.0/0` (Render uses dynamic IPs)
4. Copy the connection string: `mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/DevMesh?retryWrites=true&w=majority`

---

## Step 2 — Firebase Service Account

1. Firebase Console → Project Settings → **Service Accounts** tab
2. Click **Generate new private key** → download the JSON file
3. Note these three fields — you'll paste them into Render env vars:
   - `project_id`
   - `client_email`
   - `private_key` (the entire `-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n` string)

> Do NOT upload the JSON file anywhere. It stays local as a reference only.

---

## Step 3 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Configure:
   | Setting | Value |
   |---|---|
   | Root directory | `server` |
   | Build command | `npm install && npm run build` |
   | Start command | `npm start` |
   | Node version | 18 |

4. Add all environment variables under **Environment**:

```
PORT=10000
CLIENT_ORIGIN=https://your-app.vercel.app       ← set after Vercel deploy
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64-char random string>
JWT_EXPIRES=7d
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
OPENAI_API_KEY=sk-...
AI_SERVICE_URL=https://your-ai-service.onrender.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> **FIREBASE_PRIVATE_KEY**: Paste the `private_key` value from the JSON exactly as-is. Render stores it with literal `\n` characters — the backend converts them with `.replace(/\\n/g, "\n")`.

5. Click **Create Web Service**. Note your service URL: `https://devmesh-api.onrender.com`

---

## Step 4 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Configure:
   | Setting | Value |
   |---|---|
   | Framework | Vite |
   | Root directory | `.` (project root) |
   | Build command | `npm run build` |
   | Output directory | `dist` |

4. Add environment variables:

```
VITE_API_URL=https://devmesh-api.onrender.com/api
VITE_SOCKET_URL=https://devmesh-api.onrender.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

5. Deploy. Note your frontend URL: `https://devmesh-ai.vercel.app`

---

## Step 5 — Wire Up CORS

Go back to Render → your backend service → Environment and update:

```
CLIENT_ORIGIN=https://devmesh-ai.vercel.app
```

Trigger a redeploy (or it picks up automatically).

---

## Step 6 — Stripe Webhook (if using billing)

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://devmesh-api.onrender.com/api/billing/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`
4. Copy the signing secret → set `STRIPE_WEBHOOK_SECRET` on Render

---

## Step 7 — AI Service on Render (optional)

1. New Web Service on Render
2. Root directory: `ai-service`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add `OPENAI_API_KEY` env var
6. Update backend's `AI_SERVICE_URL` to point to this service

---

## Scaling Socket.io (multi-instance)

A single Render instance keeps presence in memory. To scale horizontally, add the Redis adapter:

```bash
cd server && npm i @socket.io/redis-adapter redis
```

```typescript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();
await Promise.all([pub.connect(), sub.connect()]);
io.adapter(createAdapter(pub, sub));
```

Enable **sticky sessions** in your load balancer, or ensure clients use `transports: ['websocket']` (already set in this project).

---

## Vercel SPA Routing Fix

If you get 404 on direct URL access (e.g. `/chat`), add a `vercel.json` at the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Quick Sanity Checks After Deploy

```bash
# Backend health
curl https://devmesh-api.onrender.com/api/health

# Check CORS headers
curl -I -H "Origin: https://devmesh-ai.vercel.app" https://devmesh-api.onrender.com/api/health
```
