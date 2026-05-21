require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const matchingRoutes = require('./routes/matching.routes');
const WebSocketService = require('./services/websocket.service');

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Middlewares globais
app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/matching', matchingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      websocket: 'active',
    },
  });
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ message: 'Flavome Backend is running!' });
});

// WebSocket
WebSocketService.initialize(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

module.exports = { app, server };
