import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { config } from './config/env';
import { setupSocket } from './socket';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import jobRoutes from './routes/jobs';
import proposalRoutes from './routes/proposals';
import messageRoutes from './routes/messages';
import reviewRoutes from './routes/reviews';

const app = express();
const server = http.createServer(app);

// Allow any localhost / 127.0.0.1 port (covers Vite, Live Server, etc.)
const devOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (file://, curl, Postman), FRONTEND_URL, or any local dev origin
    if (!origin || devOriginRegex.test(origin) || origin === config.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
};


// Export io so it can be used in controllers
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || devOriginRegex.test(origin) || origin === config.FRONTEND_URL) callback(null, true);
      else callback(new Error('CORS blocked'));
    },
    credentials: true,
  },
});


setupSocket(io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);

// Global error handler
app.use(errorHandler);

server.listen(config.PORT, () => {
  console.log(`🚀 Server running on port ${config.PORT}`);
});