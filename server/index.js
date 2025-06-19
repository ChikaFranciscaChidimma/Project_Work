import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import chatbotRoute from './routes/chatbotRoute.js'; 

// Load environment variables FIRST
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [
      process.env.VITE_APP_URL || 'https://project-work-tau.vercel.app',
      'http://localhost:8080',
      'http://localhost:5000',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  },
  path: '/socket.io', // Explicit path
  serveClient: false,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store connected clients
const connectedClients = new Set();

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  connectedClients.add(socket.id);

  // Add authentication middleware if needed
  socket.use((packet, next) => {
    // Add your authentication logic here
    next();
  });

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`Client ${socket.id} left room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    connectedClients.delete(socket.id);
  });

  // Custom events can be added here
  socket.on('subscribe', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room ${room}`);
  });
});



// Make io instance available to routes
app.locals.io = io;

// CORS configuration
const corsOptions = {
  origin: [
    process.env.VITE_APP_URL || 'https://project-work-tau.vercel.app',
    'http://localhost:8080',
    'http://localhost:5000',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Enhanced database connection with retry logic
const connectDB = async (retries = 3) => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectDB(retries - 1);
    }
    process.exit(1);
  }
};

// Test route to verify DB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const count = await mongoose.connection.db.collection('products').countDocuments();
    res.json({
      dbConnected: true,
      productCount: count,
      wsConnections: connectedClients.size
    });
  } catch (error) {
    res.status(500).json({
      dbConnected: false,
      error: error.message
    });
  }
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/chatbot', chatbotRoute);

// Enhanced health check with WebSocket status
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  res.status(200).json({ 
    status: 'ok',
    dbStatus: mongoose.connection.readyState,
    wsConnections: connectedClients.size,
    uptime: `${uptime.toFixed(2)} seconds`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Production error handling middleware
app.use((err, req, res, next) => {
  console.error('⚠️ Server error:', err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Server startup
const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 MongoDB: ${mongoose.connection.host}`);
    console.log(`🔒 CORS allowed origins: ${corsOptions.origin.join(', ')}`);
    console.log(`🔄 WebSocket server ready with ${connectedClients.size} connections`);
  });

  server.on('error', (error) => {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM. Closing server...');
  
  // Close all WebSocket connections
  io.sockets.sockets.forEach(socket => {
    socket.disconnect(true);
  });
  
  mongoose.connection.close(false, () => {
    server.close(() => {
      console.log('Server gracefully terminated');
      process.exit(0);
    });
  });
});

startServer();

// Export for Vercel
export default app;