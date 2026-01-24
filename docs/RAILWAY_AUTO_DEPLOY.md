# Railway Auto-Deploy Sozlamalari

## Muammo
Frontend push qilinganda Railway backend service ham avtomatik deploy qilinmoqda.

## Sabab
Railway'da har bir service uchun **Source** sozlamasi bor. Agar service GitHub repo'ga bog'langan bo'lsa, har qanday push avtomatik deploy'ni trigger qiladi.

## Yechim

### 1. Railway Dashboard'da tekshiring

1. Railway dashboard'ga kiring
2. Backend service'ni oching
3. **Settings** tab'ga o'ting
4. **Source** bo'limini toping
5. **Auto-Deploy** sozlamasini tekshiring

### 2. Auto-Deploy'ni o'chirish (Agar kerak bo'lsa)

Agar faqat `backend/` o'zgarishlarida deploy qilmoqchi bo'lsangiz:

1. **Settings** → **Source** → **Auto-Deploy**
2. **Deploy on Push** ni o'chiring
3. Yoki **Deploy Branch** ni faqat `backend` branch'ga o'rnating

### 3. Yoki watchPatterns qo'shing (railway.toml)

Agar `railway.toml` faylida `watchPatterns` bo'lsa, faqat shu pattern'larga mos keladigan o'zgarishlarda deploy qiladi:

```toml
[deploy]
startCommand = "npm run start:with-migration"
watchPatterns = ["backend/**"]  # Faqat backend/ o'zgarishlarida deploy
```

**Eslatma**: Hozirgi `railway.toml` da `watchPatterns` yo'q, shuning uchun barcha o'zgarishlar deploy'ni trigger qiladi.

### 4. Tavsiya

Agar backend va frontend alohida deploy qilmoqchi bo'lsangiz:

1. **Backend service**: Faqat `backend/**` o'zgarishlarida deploy
2. **Frontend service** (Vercel): Faqat `frontend/**` o'zgarishlarida deploy

Yoki:

1. Backend service'da **Auto-Deploy** ni o'chiring
2. Faqat qo'lda deploy qiling (Railway dashboard → Deploy)

### 5. Hozirgi holat

Hozirgi `railway.toml`:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start:with-migration"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

`watchPatterns` yo'q, shuning uchun barcha push'lar deploy'ni trigger qiladi.

## Qo'shimcha ma'lumot

- Railway auto-deploy: https://docs.railway.app/deploy/builds#auto-deploy
- Watch patterns: https://docs.railway.app/deploy/builds#watch-patterns
