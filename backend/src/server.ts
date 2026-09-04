import http from 'http';
import app from './app';
import { env } from './config/env.config';
import { connectDB } from './config/db.config';
import { initSocket } from './modules/notifications/socket.gateway';

const server = http.createServer(app);

// Initialize Socket.io WebSockets
initSocket(server);

// Start Database & Server Listener
const startServer = async (): Promise<void> => {
  await connectDB();

  const PORT = Number(env.PORT) || 5000;

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`[Server] Multimedia API Server running on port ${PORT}`);
    console.log(`[Swagger] Docs available at http://localhost:${PORT}/api-docs`);
    console.log(`=======================================================`);
  });
};

startServer();
