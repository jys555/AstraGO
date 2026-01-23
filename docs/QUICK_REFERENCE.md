# AstraGo Quick Reference Guide

## Current Status: ✅ Implementation Complete

All core features have been implemented according to the original requirements.

---

## What's Implemented

### ✅ Core Features
- [x] 10-minute soft reservation system
- [x] Real-time seat availability tracking
- [x] Driver reliability ranking algorithm
- [x] Telegram Mini App integration
- [x] Comparison-first trip listing
- [x] WebSocket real-time updates
- [x] Driver response tracking (2-minute timeout)
- [x] Chat deep linking (Telegram)
- [x] Map integration (Google Maps)
- [x] My Trips screen

### ✅ Backend
- [x] Express.js REST API
- [x] PostgreSQL database schema
- [x] Prisma ORM
- [x] Socket.io WebSocket server
- [x] Telegram authentication
- [x] Reservation service
- [x] Seat availability service
- [x] Driver ranking service

### ✅ Frontend
- [x] Next.js 14 (App Router)
- [x] React Query for data fetching
- [x] Tailwind CSS styling
- [x] Framer Motion animations
- [x] WebSocket client
- [x] Telegram WebApp SDK
- [x] All required pages and components

---

## Project Structure

```
AstraGo/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API routes
│   │   ├── websocket/   # Real-time handlers
│   │   └── index.ts     # Server entry
│   └── prisma/
│       └── schema.prisma # Database schema
│
├── frontend/            # Next.js app
│   ├── app/             # Pages (App Router)
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
│
└── docs/                # Documentation
    ├── SYSTEM_DESIGN.md  # Complete system design
    ├── DEPLOYMENT_GUIDE.md # Deployment instructions
    └── PLATFORM_ANALYSIS.md # Platform choice analysis
```

---

## Key Files Reference

### Backend Services
- **Reservation Logic:** `backend/src/services/reservationService.ts`
- **Driver Ranking:** `backend/src/services/driverRankingService.ts`
- **Seat Availability:** `backend/src/services/seatAvailabilityService.ts`
- **Telegram Integration:** `backend/src/services/telegramService.ts`

### Frontend Hooks
- **Reservation Management:** `frontend/hooks/useReservation.ts`
- **WebSocket Connection:** `frontend/hooks/useWebSocket.ts`
- **Trip Data:** `frontend/hooks/useTrips.ts`
- **Driver Status:** `frontend/hooks/useDriverStatus.ts`

### Components
- **Trip Card:** `frontend/components/trips/TripCard.tsx`
- **Reservation Panel:** `frontend/components/trips/ReservationPanel.tsx`
- **Timer:** `frontend/components/ui/Timer.tsx`
- **Trip List:** `frontend/components/trips/TripList.tsx`

---

## Quick Commands

### Development
```bash
# Install all dependencies
npm run install:all

# Start both backend and frontend
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev
```

### Database
```bash
# Generate Prisma client
cd backend && npm run db:generate

# Run migrations
cd backend && npm run db:migrate

# Seed database
cd backend && npm run db:seed

# Open Prisma Studio
cd backend && npm run db:studio
```

### Production
```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production
TELEGRAM_BOT_TOKEN=...
FRONTEND_URL=https://...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

---

## API Endpoints

### Trips
- `GET /api/trips` - List trips (with filters)
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create trip (driver)
- `PATCH /api/trips/:id` - Update trip
- `PATCH /api/trips/:id/seats` - Update seats

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/active` - Get active reservation
- `GET /api/reservations/:id` - Get reservation
- `PATCH /api/reservations/:id/confirm` - Confirm
- `DELETE /api/reservations/:id` - Cancel

### Users
- `GET /api/users/me` - Current user
- `PATCH /api/users/me` - Update profile
- `GET /api/users/drivers/:id/metrics` - Driver metrics

---

## WebSocket Events

### Client → Server
- `subscribe:trip/:id` - Subscribe to trip updates
- `subscribe:reservation/:id` - Subscribe to reservation
- `unsubscribe:trip/:id` - Unsubscribe

### Server → Client
- `seat_availability_changed` - Seats updated
- `reservation_created` - New reservation
- `reservation_expired` - Reservation expired
- `reservation_confirmed` - Reservation confirmed
- `driver_status_changed` - Driver online/offline
- `trip_updated` - Trip details changed

---

## Key Constants

### Reservation
- **Duration:** 10 minutes (600,000 ms)
- **Driver Response Timeout:** 2 minutes (120,000 ms)
- **Chat Archive Duration:** 24 hours

### Driver Ranking
- **Response Time Weight:** 0-40 points
- **Response Rate Weight:** 0-30 points
- **Online Status Bonus:** 0-20 points
- **Total Trips Bonus:** 0-10 points
- **Total Score:** 0-100 points

---

## Deployment Checklist

### Pre-Deployment
- [ ] Database created and accessible
- [ ] Environment variables configured
- [ ] Telegram bot created
- [ ] Google Maps API key (if using maps)
- [ ] Domain names ready (optional)

### Backend Deployment
- [ ] Railway/Render account created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Migrations run
- [ ] Health check passing

### Frontend Deployment
- [ ] Vercel account created
- [ ] Environment variables set
- [ ] Build successful
- [ ] Custom domain configured (optional)

### Telegram Setup
- [ ] Bot created via @BotFather
- [ ] Mini App URL configured
- [ ] Bot token in backend env
- [ ] Test Mini App opens correctly

---

## Testing Checklist

### Core Flows
- [ ] Search for trips
- [ ] Filter and sort trips
- [ ] Create reservation
- [ ] See countdown timer
- [ ] Open Telegram chat
- [ ] Cancel reservation
- [ ] Confirm reservation
- [ ] View in My Trips

### Edge Cases
- [ ] Multiple reservations (should cancel previous)
- [ ] Reservation expiry (auto-release)
- [ ] Driver inactive (2-minute timeout)
- [ ] Seat availability updates
- [ ] Driver goes offline during reservation

---

## Next Steps

### Immediate (Before Launch)
1. Set up production database
2. Deploy backend to Railway/Render
3. Deploy frontend to Vercel
4. Configure Telegram Mini App
5. Test end-to-end flow
6. Seed with initial data

### Short Term (Post-Launch)
1. Add error tracking (Sentry)
2. Set up analytics
3. Monitor performance
4. Gather user feedback
5. Fix bugs and optimize

### Future Enhancements
1. In-app chat (replace Telegram deep link)
2. Payment integration
3. Insurance features
4. Company/fleet accounts
5. Ratings and reviews
6. Mobile app (React Native)

---

## Support & Resources

### Documentation
- **System Design:** `docs/SYSTEM_DESIGN.md`
- **Deployment Guide:** `docs/DEPLOYMENT_GUIDE.md`
- **Platform Analysis:** `docs/PLATFORM_ANALYSIS.md`

### Key Technologies
- **Next.js:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs
- **Socket.io:** https://socket.io/docs
- **Telegram Mini Apps:** https://core.telegram.org/bots/webapps

---

**Last Updated:** 2024  
**Status:** Ready for Production Deployment
