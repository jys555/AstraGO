# Deployment Fix - Vercel va Railway Auto-Deploy

## Muammo
GitHub'ga push qilingan o'zgarishlar Vercel va Railway'ga avtomatik deploy qilinmayapti.

## Yechim

### Vercel uchun:

1. **Vercel Dashboard'ga kiring:**
   - https://vercel.com/dashboard
   - Project: `AstraGO` ni tanlang

2. **Settings → Git → Ignored Build Step ni tekshiring:**
   - Agar "Ignore build step" sozlangan bo'lsa, uni o'chiring
   - Yoki quyidagi command qo'shing:
   ```bash
   git diff HEAD^ HEAD --quiet frontend/
   ```
   - Bu faqat `frontend/` o'zgarganda build qiladi

3. **Manual Redeploy:**
   - Deployments → Latest deployment → "..." → "Redeploy"
   - Yoki "Deployments" → "New Deployment" → Branch: `main` → Deploy

4. **Watched Paths sozlamasini o'zgartirish:**
   - Settings → Git → Ignored Build Step
   - Agar watched paths bor bo'lsa, uni o'chiring yoki `frontend/**` qo'shing

### Railway uchun:

1. **Railway Dashboard'ga kiring:**
   - https://railway.app/dashboard
   - Project: `AstraGO` ni tanlang

2. **Service Settings → Source ni tekshiring:**
   - GitHub repo to'g'ri ulanganligini tekshiring
   - Branch: `main` bo'lishi kerak

3. **Manual Redeploy:**
   - Service → "Deploy" → "Redeploy"
   - Yoki Settings → "Redeploy" tugmasini bosing

4. **Auto-Deploy sozlamasini tekshirish:**
   - Settings → Source → "Auto Deploy" yoqilgan bo'lishi kerak

## Tekshirish

Deployment muvaffaqiyatli bo'lgandan keyin:

1. **Vercel:**
   - https://astra-go-navy.vercel.app
   - Yangi o'zgarishlar ko'rinishi kerak

2. **Railway:**
   - Backend URL'ni tekshiring
   - API endpoints ishlashi kerak

## Muammo davom etsa:

1. Vercel va Railway'da GitHub integration'ni qayta ulash
2. Environment variables'ni tekshirish
3. Build logs'ni ko'rib chiqish
