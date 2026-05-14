import dotenv from 'dotenv';
import App from './app';

// Load environment variables
dotenv.config();

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Create and start the application
const app = new App();

const startServer = async () => {
  try {
    // Connect to database
    await app.connectDatabase();
    
    // Start server
    const port = process.env.PORT || 3001;
    app.listen(parseInt(port.toString()));
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  
  const server = app.getServer();
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  
  const server = app.getServer();
  if (server) {
    server.close(async () => {
      console.log('💥 Process terminated!');
      await app.disconnectDatabase();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start the server
startServer();
