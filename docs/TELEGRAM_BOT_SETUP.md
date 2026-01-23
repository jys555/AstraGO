# Telegram Bot va Mini App Sozlash

## 1. Bot Yaratish

### 1.1 BotFather orqali bot yaratish

1. Telegram'da `@BotFather` ni oching
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting: `AstraGo`
4. Bot username kiriting: `AstraGO_bot` (yoki boshqa, lekin `_bot` bilan tugashi kerak)
5. BotFather bot token beradi - **SAQLANG!**

### 1.2 Bot Token'ni sozlash

Railway'da backend service'ga environment variable qo'shing:
- **Name**: `TELEGRAM_BOT_TOKEN`
- **Value**: BotFather'dan olgan token'ingiz

## 2. Mini App Yaratish

### 2.1 BotFather orqali Mini App yaratish

1. `@BotFather` ga `/newapp` yuboring
2. Bot'ingizni tanlang (`AstraGO_bot`)
3. Mini App nomini kiriting: `AstraGo`
4. Mini App description: `Intercity shared taxi platform`
5. Mini App photo yuklang (optional)
6. Mini App short name: `AstraGo`
7. **Web App URL**: Vercel frontend URL'ingiz
   - Masalan: `https://astra-go-navy.vercel.app`

### 2.2 Mini App URL'ni o'zgartirish

Agar URL o'zgarsa:
1. `@BotFather` ga `/myapps` yuboring
2. Bot'ingizni tanlang
3. Mini App'ni tanlang
4. "Edit Web App URL" ni tanlang
5. Yangi URL'ni kiriting

## 3. Bot'ni Test Qilish

### 3.1 Bot'ni ochish

1. Telegram'da bot'ingizni qidiring: `@AstraGO_bot`
2. `/start` yuboring
3. Bot javob berishi kerak

### 3.2 Mini App'ni ochish

1. Bot'da "Open App" yoki "Launch" tugmasini bosing
2. Mini App ochilishi kerak
3. Telegram user ma'lumotlari avtomatik yuklanishi kerak

## 4. Authentication Flow

### 4.1 Telegram'da ishlash

1. User Telegram'da bot'ni ochadi
2. Mini App ochiladi
3. `window.Telegram.WebApp.initData` avtomatik mavjud bo'ladi
4. Bu initData har bir API request'da `x-telegram-init-data` header sifatida yuboriladi
5. Backend initData'ni validate qiladi (HMAC SHA-256)
6. User avtomatik authenticate bo'ladi

### 4.2 Development'da test qilish

Development'da Telegram'da bo'lmasa ham ishlaydi (development mode):
- `x-dev-user-id` header ishlatiladi
- Bu faqat development uchun

### 4.3 Production'da

Production'da:
- Faqat Telegram Mini App'da ishlaydi
- Agar Telegram'da bo'lmasa, error ko'rsatiladi
- Authentication required

## 5. Environment Variables

### Backend (Railway)

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
FRONTEND_URL=https://astra-go-navy.vercel.app
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://astrago-production.up.railway.app
```

## 6. Bot Commands (Optional)

Bot'ga commands qo'shish uchun:

1. `@BotFather` ga `/setcommands` yuboring
2. Bot'ingizni tanlang
3. Quyidagi commands'ni kiriting:

```
start - Start using AstraGo
search - Search for trips
mytrips - View my trips
help - Get help
```

## 7. Troubleshooting

### Mini App ochilmayapti

- Vercel URL'ni tekshiring
- BotFather'da Web App URL to'g'ri ekanligini tekshiring
- HTTPS ishlatilayotganligini tekshiring (HTTP ishlamaydi)

### Authentication ishlamayapti

- `TELEGRAM_BOT_TOKEN` Railway'da to'g'ri sozlanganligini tekshiring
- Backend logs'da initData validation xatolarini tekshiring
- Frontend'da `initData` mavjudligini console'da tekshiring

### CORS xatolari

- Backend'da `FRONTEND_URL` to'g'ri sozlanganligini tekshiring
- Vercel URL'ni backend CORS'ga qo'shing
