import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3002",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3002",
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlgoHub POS API',
      version: '1.0.0',
      description: 'AI-powered Point of Sale System API',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API routes
app.get('/api/test', (req, res) => {
  res.json({
    message: 'AlgoHub POS API is running!',
    timestamp: new Date().toISOString(),
    features: [
      'AI-Powered Product Recommendations',
      'Voice Search Integration',
      'Visual Product Recognition',
      'Real-time Analytics',
      'Multi-tenant Architecture'
    ]
  });
});

// Mock products endpoint for POS
app.get('/api/products', (req, res) => {
  const mockProducts = [
    { id: '1', name: 'Espresso', price: 3.50, category: 'Coffee', inStock: true },
    { id: '2', name: 'Cappuccino', price: 4.50, category: 'Coffee', inStock: true },
    { id: '3', name: 'Latte', price: 4.00, category: 'Coffee', inStock: true },
    { id: '4', name: 'Americano', price: 3.25, category: 'Coffee', inStock: true },
    { id: '5', name: 'Croissant', price: 2.25, category: 'Bakery', inStock: true },
    { id: '6', name: 'Muffin', price: 2.75, category: 'Bakery', inStock: true },
    { id: '7', name: 'Milk', price: 0.50, category: 'Dairy', inStock: true },
    { id: '8', name: 'Sugar', price: 0.25, category: 'Supplies', inStock: true },
  ];
  
  res.json({
    success: true,
    data: mockProducts,
    count: mockProducts.length
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected to Socket.IO:', socket.id);
  
  // Join room for real-time updates
  socket.join('pos-updates');
  
  // Send welcome message
  socket.emit('welcome', {
    message: 'Connected to AlgoHub POS Real-time Updates',
    timestamp: new Date().toISOString()
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 AlgoHub POS Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔌 Socket.IO server is ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, server, io };
