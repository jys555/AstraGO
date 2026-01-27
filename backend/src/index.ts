import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import tripsRouter from './routes/trips';
import reservationsRouter from './routes/reservations';
import usersRouter from './routes/users';
import chatsRouter from './routes/chats';
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

// Get frontend URL and normalize it (remove trailing slash)
const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const frontendUrl = getFrontendUrl();

// Get allowed origins (support multiple origins for different deployments)
const getAllowedOrigins = () => {
  const origins = [frontendUrl];
  
  // Add Vercel deployment URLs
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  
  // Add Telegram Web domains
  origins.push('https://web.telegram.org');
  
  // Add common Vercel patterns
  if (frontendUrl.includes('vercel.app')) {
    origins.push('https://*.vercel.app');
  }
  
  return origins;
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin matches (handle wildcard patterns)
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // For development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
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
app.use('/api/chats', chatsRouter);

// Error handler (must be last)
app.use(errorHandler);

// Setup WebSocket handlers
setupWebSocketHandlers(io);

// Export io for use in controllers
export function getIO() {
  return io;
}

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
