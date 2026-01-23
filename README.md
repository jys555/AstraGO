# AstraGo - Shared Taxi Platform

A miniapp-based platform for intercity and interregional shared taxi services with time-based soft reservations, real-time seat availability, and driver reliability ranking.

## Features

- **Time-Based Soft Reservations**: 10-minute non-binding reservations for passengers to negotiate with drivers
- **Real-Time Updates**: WebSocket-based live seat availability and reservation status
- **Driver Reliability Ranking**: Automatic ranking based on response time and reliability
- **Telegram Mini App Integration**: MVP support for Telegram with PWA-ready architecture
- **Comparison-First Design**: Trip cards showing all relevant information for easy comparison
- **Chat Integration**: Deep linking to Telegram chat for negotiations

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- React Query (data fetching)
- Socket.io Client (WebSocket)

### Backend
- Node.js / Express
- TypeScript
- PostgreSQL (Prisma ORM)
- Socket.io (WebSocket server)
- Zod (validation)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3001)
- `TELEGRAM_BOT_TOKEN`: Telegram bot token (optional for development)
- `FRONTEND_URL`: Frontend URL (default: http://localhost:3000)

4. Set up the database:
```bash
npm run db:generate
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
AstraGo/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── routes/          # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utilities
│   │   ├── websocket/       # WebSocket handlers
│   │   └── index.ts         # Server entry point
│   └── prisma/
│       └── schema.prisma    # Database schema
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and API client
│   └── types/               # TypeScript types
└── docs/
    └── PLATFORM_ANALYSIS.md # Platform choice analysis
```

## Key Features Implementation

### Soft Reservation System

- 10-minute reservation window
- Auto-expiry on timeout
- Single active reservation per passenger
- Real-time seat availability updates

### Driver Response Tracking

- Tracks response time from reservation creation
- Marks driver as inactive if no response in 2 minutes
- Updates driver metrics for ranking

### Real-Time Updates

WebSocket events:
- `seat_availability_changed`: When seats update
- `reservation_created`: New reservation notification
- `reservation_expired`: Reservation timeout
- `reservation_confirmed`: Reservation confirmed
- `driver_status_changed`: Driver online/offline
- `trip_updated`: Trip details changed

## API Endpoints

### Trips
- `GET /api/trips` - List trips (with filters)
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create trip (driver)
- `PATCH /api/trips/:id` - Update trip
- `PATCH /api/trips/:id/seats` - Update available seats

### Reservations
- `POST /api/reservations` - Create soft reservation
- `GET /api/reservations/:id` - Get reservation status
- `GET /api/reservations/active` - Get active reservation
- `PATCH /api/reservations/:id/confirm` - Confirm reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update user profile
- `GET /api/users/drivers/:id/metrics` - Get driver metrics

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Database Migrations

```bash
cd backend
npm run db:migrate
```

### Prisma Studio (Database GUI)

```bash
cd backend
npm run db:studio
```

## Deployment

### Backend

The backend can be deployed to Railway, Render, or any Node.js hosting service.

1. Set environment variables
2. Run database migrations
3. Start the server: `npm start`

### Frontend

The frontend can be deployed to Vercel (recommended for Next.js) or any static hosting service.

1. Set `NEXT_PUBLIC_API_URL` environment variable
2. Build: `npm run build`
3. Start: `npm start`

## Future Enhancements

- Payment integration
- Insurance features
- Company/fleet accounts
- Ratings and reviews
- In-app chat (currently uses Telegram deep links)
- Mobile app (React Native)

## License

MIT
