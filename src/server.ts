import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import connectDB from './config/db';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerChatSockets } from './apps/chat.sockets';
import forumRoutes from './routes/forum.routes'; // Import the provided routes

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = createServer(app);

// Attach Socket.IO to it
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// Set Socket.IO instance on app for controller access
app.set('io', io);

// Register chat socket events (for connection/disconnection)
registerChatSockets(io);

// Use forum routes
app.use('/api', forumRoutes); // Mount routes under /api

// Connect DB and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server + Chat running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });