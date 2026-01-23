# Vercel Deployment Notes

## Important: Vercel Project Settings

Vercel'da project settings'da quyidagilarni sozlash kerak:

1. **Settings → General → Root Directory:** `frontend` ga o'rnatish
2. **Settings → Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = Backend URL (masalan: `https://your-backend.railway.app`)

## Build Issues

Agar build xatolik bersa:

1. Vercel Dashboard → Project → Settings → General
2. **Root Directory** ni `frontend` ga o'zgartiring
3. **Redeploy** tugmasini bosing

## Manual Deployment

Agar avtomatik deployment ishlamasa:

```bash
cd frontend
vercel --prod
```

Yoki Vercel Dashboard'da:
1. Deployments → New Deployment
2. Branch: `main`
3. Root Directory: `frontend`
4. Deploy
