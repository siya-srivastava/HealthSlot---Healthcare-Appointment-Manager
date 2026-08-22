# 🚀 HealthSlot — Complete Free Cloud Hosting & Deployment Guide

This guide walks you through deploying the full-stack **HealthSlot** platform live on the internet using free cloud tiers:
- **Database**: MongoDB Atlas (Free M0 Cluster)
- **Backend API**: Render or Railway (Free Web Service)
- **Frontend SPA**: Vercel (Free Global CDN)

---

## Part 1: Setup Free Database on MongoDB Atlas (2 Minutes)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up/sign in.
2. Click **Create** and choose the **M0 Free Cluster** (Shared).
3. Under **Security Quickstart**:
   - **Username & Password**: Create a database user (e.g. `healthadmin` / `YourSecurePass123`).
   - **Network Access**: Add IP Address $\rightarrow$ select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
4. Click **Connect $\rightarrow$ Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://healthadmin:<password>@cluster0.mongodb.net/healthslot?retryWrites=true&w=majority
   ```

---

## Part 2: Deploy Backend to Render (or Railway)

### Using Render (Free):
1. Push your project to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New + $\rightarrow$ Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `healthslot-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Add the **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `mongodb+srv://healthadmin:<password>@cluster0...` |
   | `JWT_SECRET` | `your_super_secret_jwt_key_2026` |
   | `FRONTEND_URL` | `https://your-healthslot-app.vercel.app` |
   | `GEMINI_API_KEY` | *(Optional for cloud AI triage)* |
6. Click **Create Web Service**.
7. Once deployed, copy your live backend URL (e.g., `https://healthslot-api.onrender.com`).

---

## Part 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com/) and click **Add New... $\rightarrow$ Project**.
2. Import your GitHub repository.
3. In the project setup:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://healthslot-api.onrender.com/api` (your Render backend URL with `/api`) |
5. Click **Deploy**.
6. In ~30 seconds, your application will be live at:
   ```
   https://healthslot.vercel.app
   ```

---

## Part 4: Connect Backend & Frontend CORS

In your Render dashboard:
1. Update `FRONTEND_URL` to match your exact Vercel URL (`https://healthslot.vercel.app`).
2. Your live application is now fully synced and ready to submit!
