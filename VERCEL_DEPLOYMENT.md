# Deploying Placement Management System on Vercel

This repository is pre-configured with **`vercel.json`**, **`api/index.py`**, and **pre-collected static files** for instant deployment on [Vercel](https://vercel.com).

---

## 🚀 Quick Step-by-Step Vercel Deployment

1. **Sign in to Vercel**:
   Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account (`dharun777-star`).

2. **Import Project**:
   - Click **Add New...** $\rightarrow$ **Project**.
   - Find and select the repository: **`PlacementManagementSystem`**.

3. **Configure Project Settings**:
   - **Framework Preset**: Leave as **Other** (Vercel automatically detects `vercel.json`).
   - **Root Directory**: Leave as **`./`** (root).
   - **Build and Output Settings**: Leave default (configured via `vercel.json`).
   - **Environment Variables** (optional):
     - `DJANGO_SECRET_KEY`: `your-secret-key-here` (or leave default for demo)
     - `DJANGO_DEBUG`: `False`

4. **Click Deploy**:
   - Hit the **Deploy** button.
   - Vercel will build the serverless function and deploy static assets across its global CDN.

5. **Your Site is Live!**:
   You will receive a permanent HTTPS domain like:
   👉 **`https://placement-management-system-xxxx.vercel.app`**

---

## 🛠️ How Vercel Integration Works in this Project

- **`vercel.json`**:
  - Routes `/static/(.*)` directly to `/backend/staticfiles/$1` via Vercel Edge CDN.
  - Routes all API requests (`/api/...`) and page views to `api/index.py`.
- **`api/index.py`**:
  - Serverless WSGI adapter initializing Django cleanly in serverless environments.
- **SQLite Database Support on Serverless**:
  - On Vercel, the app directory is read-only at runtime. In `backend/placement_project/settings.py`, the system detects Vercel (`'VERCEL' in os.environ`) and automatically copies the pre-seeded `db.sqlite3` to `/tmp/db.sqlite3` where it has full read-write permissions, allowing all student, company, and placement CRUD operations to function properly!
