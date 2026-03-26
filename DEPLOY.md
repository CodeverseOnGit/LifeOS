# NEXUS — Deployment Guide

## Project Structure

This is a **pure frontend app** (no backend required) — all data is stored in localStorage.
If you ever want a backend (sync across devices, user auth), use the Render section below.

```
nexus/
├── index.html          ← The entire app
├── DEPLOY.md           ← This file
└── (optional backend)
    ├── server.js
    ├── package.json
    └── .env
```

---

## STEP 1 — Push to GitHub

1. Create a new repo on https://github.com/new
   - Name it: `nexus-dashboard`
   - Set it to **Public** (required for free Netlify/Render)
   - Do NOT initialize with README

2. Open your terminal and run:

```bash
git init
git add .
git commit -m "initial commit: nexus dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nexus-dashboard.git
git push -u origin main
```

---

## STEP 2 — Deploy Frontend to Netlify

Netlify hosts static sites for free with automatic deploys on every push.

1. Go to https://app.netlify.com → **Add new site** → **Import an existing project**
2. Click **GitHub** → Authorize Netlify → Select `nexus-dashboard`
3. Configure build settings:
   - **Branch to deploy:** `main`
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.` (a single dot, meaning root)
4. Click **Deploy site**

Your app will be live at `https://random-name.netlify.app` in ~30 seconds.

### Auto-deploys
Every time you `git push origin main`, Netlify automatically redeploys. No manual steps needed.

### Custom domain (optional)
In Netlify → Site settings → Domain management → Add custom domain.

---

## STEP 3 — (Optional) Backend on Render

Only needed if you want data to sync across devices or multiple users.

### Create a minimal Express backend

Create `server.js`:
```js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory store (replace with a DB for persistence)
let store = {};

app.get('/data/:userId', (req, res) => {
  res.json(store[req.params.userId] || {});
});

app.post('/data/:userId', (req, res) => {
  store[req.params.userId] = req.body;
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3001, () => console.log('Server running'));
```

Create `package.json`:
```json
{
  "name": "nexus-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```

Push backend to GitHub (can be a separate repo or subfolder).

### Deploy to Render

1. Go to https://render.com → **New** → **Web Service**
2. Connect GitHub → Select your repo
3. Configure:
   - **Name:** `nexus-backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
4. Click **Create Web Service**

Your API will be at `https://nexus-backend.onrender.com`

### Connect frontend to backend
In `index.html`, add this after the `load()` function:
```js
const API = 'https://nexus-backend.onrender.com';
const USER_ID = 'my-user'; // hardcode or prompt for login

async function syncToServer() {
  await fetch(`${API}/data/${USER_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state)
  });
}

async function loadFromServer() {
  const res = await fetch(`${API}/data/${USER_ID}`);
  const remote = await res.json();
  if (remote && Object.keys(remote).length) state = remote;
}
```

Call `loadFromServer()` on init and `syncToServer()` inside `save()`.

---

## Auto-Deploy Flow Summary

```
You edit code locally
    ↓
git add . && git commit -m "update" && git push
    ↓
GitHub receives push
    ↓
Netlify webhook fires → rebuilds in ~15 seconds → live
Render webhook fires → restarts server in ~30 seconds → live
```

No manual clicking required after initial setup.
