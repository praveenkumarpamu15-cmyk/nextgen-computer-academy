# Deploying NextGen Computer Academy on Vercel

This project ships with a ready-to-use `vercel.json` that serves the React
frontend and the FastAPI backend from the same Vercel project.

---

## 1. Prerequisites

- A Vercel account with the connected GitHub repository.
- A **MongoDB Atlas** cluster (or any Mongo hosted on the public internet).
  Vercel serverless cannot connect to `localhost` Mongo.
- Your **Emergent Universal LLM Key** (already used in development).
- *(Optional)* A **Resend** API key for admission / demo-booking emails.

---

## 2. Required Environment Variables

Add these under **Vercel → Project → Settings → Environment Variables**.
Set each one for **Production**, **Preview** and **Development** as needed.

| Variable | Required | Example / Value |
|---|---|---|
| `MONGO_URL` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `DB_NAME` | ✅ | `nextgen_academy` |
| `EMERGENT_LLM_KEY` | ✅ | `sk-emergent-…` (your key) |
| `JWT_SECRET` | ✅ | any long random string |
| `ADMIN_EMAIL` | ✅ | `admin@nextgen.local` |
| `ADMIN_PASSWORD` | ✅ | strong password |
| `APP_NAME` | optional | `nextgen-academy` (used as object-storage prefix) |
| `CORS_ORIGINS` | optional | `*` |
| `RESEND_API_KEY` | optional | `re_…` — leave empty to disable emails |
| `SENDER_EMAIL` | optional | `onboarding@resend.dev` for testing |
| `PIP_EXTRA_INDEX_URL` | **✅ (build-time)** | `https://d33sy5i8bnduwe.cloudfront.net/simple/` |
| `REACT_APP_BACKEND_URL` | ✅ (build-time) | leave **empty string** so the frontend calls `/api/...` on the same origin |

> **Why `PIP_EXTRA_INDEX_URL`?**
> `emergentintegrations` lives on Emergent's private PyPI mirror.
> Vercel's Python builder honours this env variable during `pip install`.

---

## 3. First-Time Deploy

1. Push the repo to GitHub (Emergent → *Save to GitHub*).
2. In Vercel, **Import Project → select the repository**.
3. Framework preset: **Other** (Vercel will read `vercel.json`).
4. Under *Environment Variables*, paste every variable from the table above.
5. Click **Deploy**.

The first build takes 3–5 minutes:
- `@vercel/static-build` runs `yarn install && yarn build` in `frontend/`.
- `@vercel/python` builds a serverless Lambda from `backend/server.py`.

---

## 4. Post-Deploy Checklist

- Open `https://<your-project>.vercel.app/api/` — should return
  `{"ok": true, "service": "NextGen Computer Academy"}`.
- Open `https://<your-project>.vercel.app/` — homepage should load.
- Log into `/admin` with your seeded credentials.
- Verify sitemap at `/api/sitemap.xml` and `/api/robots.txt`.

---

## 5. Known Limitations on Vercel

| Concern | Detail |
|---|---|
| **AI chat streaming** | Vercel Hobby tier has a **10-second** Lambda timeout. Long AI replies may be cut off. Upgrade to **Pro (60 s)** if streaming feels short. |
| **Photo uploads** | Vercel Hobby has a **4.5 MB body limit**. Instruct students to upload smaller passport-size photos. |
| **Cold starts** | First request after inactivity may take 1–3 seconds while the Python Lambda warms up. |
| **Object storage** | Files continue to be stored on **Emergent Object Storage** (external HTTPS API), not on Vercel's disk. This works fine but requires your `EMERGENT_LLM_KEY` env var. |
| **Mongo connection pooling** | Motor opens a fresh connection on each cold start. Use MongoDB Atlas with connection limits ≥ 100. |

---

## 6. Custom Domain

1. Vercel → *Domains* → add your domain (e.g. `nextgencomputeracademy.in`).
2. Update DNS as instructed by Vercel.
3. In the admin panel → *Site Content → SEO*, set **Canonical Site URL**
   to `https://nextgencomputeracademy.in` so sitemap.xml and Open Graph
   tags emit absolute URLs.

---

## 7. Rolling Back

Every deploy is versioned on Vercel. Use the *Deployments* tab
to promote or roll back at any time — no data loss (all state
lives in MongoDB Atlas + Emergent Object Storage).
