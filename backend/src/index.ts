import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import tripsRouter from './routes/trips';
import reservationsRouter from './routes/reservations';
import usersRouter from './routes/users';
import { setupWebSocketHandlers } from './websocket/handlers';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://astra-go-navy.vercel.app',
  'https://*.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed origins
    if (allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        return origin.includes(allowed.replace('*', ''));
      }
      return origin === allowed;
    })) {
      return callback(null, true);
    }
    
    // For development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-init-data', 'x-dev-user-id'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/trips', tripsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/users', usersRouter);

// Error handler (must be last)
app.use(errorHandler);

// Setup WebSocket handlers
setupWebSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
