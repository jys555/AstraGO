# AstraGo Deployment Guide

## Quick Start: Production Deployment

### Prerequisites
- PostgreSQL database (Railway, Supabase, or self-hosted)
- Node.js 18+ installed locally (for migrations)
- GitHub repository (optional, for CI/CD)
- Telegram Bot Token (from @BotFather)

---

## Step 1: Backend Deployment (Railway Recommended)

### 1.1 Create Railway Account & Project
1. Go to [railway.app](https://railway.app)
2. Sign up/login
3. Click "New Project"
4. Select "Deploy from GitHub repo" (or "Empty Project")

### 1.2 Add PostgreSQL Database
1. In Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will create database and provide connection string

### 1.3 Deploy Backend Service
1. Click "+ New" → "GitHub Repo" (or "Empty Service")
2. Select your repository
3. Set **Root Directory** to `backend`
4. Railway will auto-detect Node.js

### 1.4 Configure Environment Variables
In Railway service settings, add these variables:

```env
DATABASE_URL=postgresql://user:pass@host:port/dbname?schema=public
# (Railway provides this automatically for PostgreSQL service)

PORT=3001
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 1.5 Set Build & Start Commands
In Railway service settings:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### 1.6 Run Database Migrations
**Option A: Via Railway CLI**
```bash
railway link
railway run npm run db:migrate
```

**Option B: Via Railway Dashboard**
1. Go to service → "Deployments"
2. Click "New Deployment"
3. Use command: `npm run db:migrate`

**Option C: Local Migration (if DB is accessible)**
```bash
cd backend
DATABASE_URL="your_railway_db_url" npm run db:migrate
```

### 1.7 (Optional) Seed Database
```bash
railway run npm run db:seed
```

### 1.8 Get Backend URL
Railway will provide a URL like: `https://astrago-backend-production.up.railway.app`

**Note this URL** - you'll need it for frontend configuration.

---

## Step 2: Frontend Deployment (Vercel Recommended)

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub

### 2.2 Import Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Vercel will auto-detect Next.js

### 2.3 Configure Environment Variables
In Vercel project settings → "Environment Variables":

```env
NEXT_PUBLIC_API_URL=https://astrago-backend-production.up.railway.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key (optional)
```

### 2.4 Deploy
Vercel will automatically:
- Install dependencies
- Build the project
- Deploy to production

You'll get a URL like: `https://astrago-frontend.vercel.app`

---

## Step 3: Telegram Mini App Setup

### 3.1 Create Telegram Bot
1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Follow instructions to create bot
4. Save the **Bot Token**

### 3.2 Configure Mini App
1. Send `/newapp` to @BotFather
2. Select your bot
3. Provide:
   - **Title:** AstraGo
   - **Description:** Shared taxi platform
   - **Photo:** Upload app icon (optional)
   - **Web App URL:** `https://astrago-frontend.vercel.app`
   - **Short Name:** astrago (for `t.me/yourbot/astrago`)

### 3.3 Update Backend with Bot Token
In Railway backend service, update:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_step_3.1
```

Redeploy backend service.

---

## Step 4: Custom Domain (Optional)

### 4.1 Backend Domain
In Railway:
1. Go to service → "Settings" → "Networking"
2. Click "Generate Domain" or add custom domain
3. Update `FRONTEND_URL` in backend env if needed

### 4.2 Frontend Domain
In Vercel:
1. Go to project → "Settings" → "Domains"
2. Add your custom domain (e.g., `astrago.com`)
3. Follow DNS configuration instructions
4. Update Telegram Mini App URL if needed

---

## Step 5: Verify Deployment

### 5.1 Test Backend
```bash
curl https://your-backend-url.railway.app/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### 5.2 Test Frontend
1. Open `https://your-frontend-url.vercel.app`
2. Should see home page
3. Check browser console for errors

### 5.3 Test Telegram Mini App
1. Open Telegram
2. Search for your bot
3. Click "Open App" or use `/start` command
4. Mini app should open in Telegram

### 5.4 Test Full Flow
1. Create a test user (via Telegram)
2. Create a test trip (as driver)
3. Search for trip (as passenger)
4. Create reservation
5. Verify 10-minute countdown
6. Test cancellation
7. Test confirmation

---

## Step 6: Monitoring & Maintenance

### 6.1 Railway Monitoring
- View logs in Railway dashboard
- Set up alerts for errors
- Monitor database usage

### 6.2 Vercel Monitoring
- View analytics in Vercel dashboard
- Monitor build times
- Check error logs

### 6.3 Database Backups
Railway PostgreSQL:
- Automatic daily backups (if enabled)
- Manual backup via Railway CLI

### 6.4 Update Process
1. Push changes to GitHub
2. Railway/Vercel auto-deploys
3. Run migrations if schema changed:
   ```bash
   railway run npm run db:migrate
   ```

---

## Alternative Deployment Options

### Backend Alternatives

**Render:**
1. Create account at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Set root directory: `backend`
5. Build: `npm install && npm run build`
6. Start: `npm start`
7. Add PostgreSQL database
8. Set environment variables

**Fly.io:**
1. Install Fly CLI
2. `fly launch` in backend directory
3. Configure `fly.toml`
4. `fly deploy`

**Self-Hosted (VPS):**
1. Set up Node.js on server
2. Clone repository
3. Install dependencies
4. Set up PM2 or systemd
5. Configure nginx reverse proxy
6. Set up SSL (Let's Encrypt)

### Frontend Alternatives

**Netlify:**
1. Connect GitHub repo
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/.next`
4. Configure environment variables

**Cloudflare Pages:**
1. Connect GitHub repo
2. Framework preset: Next.js
3. Build command: `cd frontend && npm run build`
4. Configure environment variables

---

## Environment Variables Reference

### Backend (.env)
```env
# Required
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production
TELEGRAM_BOT_TOKEN=...
FRONTEND_URL=https://...

# Optional
REDIS_URL=redis://... (for caching)
```

### Frontend (.env.local)
```env
# Required
NEXT_PUBLIC_API_URL=https://...

# Optional
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

---

## Troubleshooting

### Backend Issues

**Database Connection Error:**
- Check `DATABASE_URL` format
- Verify database is accessible
- Check firewall rules

**WebSocket Not Working:**
- Verify CORS settings
- Check `FRONTEND_URL` matches frontend domain
- Ensure WebSocket ports are open

**Telegram Auth Failing:**
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check `initData` validation logic
- Test in development mode first

### Frontend Issues

**API Calls Failing:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS on backend
- Check browser console for errors

**Telegram Mini App Not Loading:**
- Verify URL in @BotFather matches frontend URL
- Check HTTPS is enabled
- Verify Telegram WebApp SDK is loaded

**Build Failures:**
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors

---

## Security Checklist

- [ ] HTTPS enabled (Vercel/Railway default)
- [ ] Environment variables not exposed
- [ ] Database credentials secure
- [ ] Telegram bot token secure
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React default)

---

## Cost Estimation

### Railway (Backend + Database)
- **Hobby Plan:** $5/month (500 hours)
- **Pro Plan:** $20/month (unlimited)
- **PostgreSQL:** Included in plan

### Vercel (Frontend)
- **Hobby Plan:** Free (100GB bandwidth)
- **Pro Plan:** $20/month (unlimited)

### Total (Hobby)
- **Minimum:** ~$5/month (Railway) + Free (Vercel)
- **Recommended:** ~$20/month (Railway Pro) + Free (Vercel)

---

## Next Steps After Deployment

1. **Set up monitoring** (Sentry, LogRocket, etc.)
2. **Configure analytics** (Google Analytics, Plausible)
3. **Set up error tracking** (Sentry)
4. **Create admin dashboard** (optional)
5. **Set up CI/CD** (GitHub Actions)
6. **Document API** (Swagger/OpenAPI)
7. **Load testing** (k6, Artillery)
8. **Security audit**

---

**Last Updated:** 2024  
**Status:** Production Ready
