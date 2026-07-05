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

import { logger, morganStream } from './utils/logger';
import { database } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Import routes (will be created as we build them)
import authRoutes from './routes/auth-simple';
import productRoutes from './routes/productRoutes';

class App {
  public app: express.Application;
  public server: any;
  public io: SocketIOServer;

  constructor() {
    this.app = express();
    const allowedOrigins = this.getAllowedOrigins();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
      }
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.initializeSocketIO();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: this.getAllowedOrigins(),
      credentials: true
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    this.app.use(morgan('combined', { stream: morganStream }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.'
      }
    });
    this.app.use('/api/', limiter);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: database.isConnected() ? 'connected' : 'disconnected'
      });
    });
  }

  private getAllowedOrigins(): string[] | string {
    const origins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN;
    if (!origins && process.env.NODE_ENV === 'production') {
      return [];
    }

    const originConfig = origins || 'http://localhost:3000';
    const parsed = originConfig
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean);

    return parsed.length > 1 ? parsed : parsed[0];
  }

  private initializeRoutes(): void {
    // API routes will be added here as we create them
    this.app.use('/api/auth', authRoutes);
    // this.app.use('/api/tenants', tenantRoutes);
    // this.app.use('/api/users', userRoutes);
    this.app.use('/api/products', productRoutes);
    // this.app.use('/api/sales', saleRoutes);

    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        message: 'AlgoHub POS API v1.0.0',
        version: '1.0.0',
        documentation: '/api-docs'
      });
    });
  }

  private initializeSwagger(): void {
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'AlgoHub POS API',
          version: '1.0.0',
          description: 'Multi-tenant Point of Sale and Inventory Management API',
          contact: {
            name: 'AlgoHub Team',
            email: 'support@algohub.com'
          }
        },
        servers: [
          {
            url: process.env.NODE_ENV === 'production' 
              ? 'https://api.algohub.com' 
              : `http://localhost:${process.env.PORT || 3001}`,
            description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
        security: [
          {
            bearerAuth: []
          }
        ]
      },
      apis: ['./src/routes/*.ts', './src/models/*.ts']
    };

    const specs = swaggerJsdoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'AlgoHub POS API Documentation'
    }));
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Join tenant room
      socket.on('join-tenant', (tenantId: string) => {
        socket.join(`tenant-${tenantId}`);
        logger.info(`Client ${socket.id} joined tenant ${tenantId}`);
      });

      // Join warehouse room
      socket.on('join-warehouse', (warehouseId: string) => {
        socket.join(`warehouse-${warehouseId}`);
        logger.info(`Client ${socket.id} joined warehouse ${warehouseId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    // Make io available throughout the app
    this.app.set('io', this.io);
  }

  public async connectDatabase(): Promise<void> {
    await database.connect();
  }

  public async disconnectDatabase(): Promise<void> {
    await database.disconnect();
  }

  public listen(port: number): void {
    this.server.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`📚 API Documentation: http://localhost:${port}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${port}/health`);
    });
  }

  public getServer() {
    return this.server;
  }

  public getApp() {
    return this.app;
  }

  public getIO() {
    return this.io;
  }
}

export default App;
