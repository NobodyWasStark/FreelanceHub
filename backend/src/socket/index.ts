import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

export const setupSocket = (io: Server) => {
  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      if (!token) {
        const cookieHeader = socket.handshake.headers.cookie;
        if (cookieHeader) {
          const tokenMatch = cookieHeader.match(/jwt=([^;]+)/);
          if (tokenMatch) {
            token = tokenMatch[1];
          }
        }
      }

      if (!token) {
        return next(new Error('Authentication error - No token found'));
      }

      const decoded = verifyToken(token);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.id}`);

    // Join personal room to receive messages
    socket.join(socket.data.user.id);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });
  });
};