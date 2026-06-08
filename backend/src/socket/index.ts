import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

export const setupSocket = (io: Server) => {
  io.use((socket, next) => {
    try {
      // Typically, for WebSockets, you'd pass the token via handshake auth
      // or parse the cookie from socket.handshake.headers.cookie
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error('Authentication error - No cookies found'));
      }

      const tokenMatch = cookieHeader.match(/jwt=([^;]+)/);
      if (!tokenMatch) {
        return next(new Error('Authentication error - No token found'));
      }

      const decoded = verifyToken(tokenMatch[1]);
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
