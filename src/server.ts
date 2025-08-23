import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerChatSockets } from './apps/chat.sockets';
import forumRoutes from './routes/forum.routes';

const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173", "https://upskillr.online"],
    credentials: true,
  },
}); 

// Attach Socket.IO to app for access in controllers
app.set('io', io);

// Register chat socket events
registerChatSockets(io);

// Mount forum routes
app.use('/api', forumRoutes);

// Connect to DB and start server
(async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server + Chat running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
})();