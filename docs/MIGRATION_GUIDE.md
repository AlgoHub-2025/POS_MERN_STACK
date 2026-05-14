# AlgoHub POS Migration Guide

This guide provides detailed instructions for migrating from the original NestJS/PostgreSQL system to the new MERN stack implementation.

## Overview

The migration involves:
- **Database**: PostgreSQL → MongoDB
- **Backend**: NestJS → Express.js with TypeScript
- **Frontend**: React (unchanged but with improved state management)
- **Authentication**: Passport JWT → Custom JWT middleware
- **Real-time**: NestJS WebSockets → Socket.IO

## Prerequisites

1. **Node.js 20+** installed
2. **Docker & Docker Compose** for containerized development
3. **MongoDB 7+** (or use Docker setup)
4. **Redis 7+** for caching and queues
5. **Git** for version control

## Quick Start with Docker

### 1. Clone and Setup

```bash
# Navigate to the MERN stack directory
cd "E:\PROJECT MANAGEMET\POS_MERNSTACK"

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Start Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379

## Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## Database Migration

### 1. Export Data from PostgreSQL

```bash
# Create export script
cd scripts
node export-postgres-data.js
```

### 2. Transform and Import to MongoDB

```bash
# Transform data for MongoDB schema
node transform-data.js

# Import to MongoDB
node import-mongodb-data.js
```

### 3. Verify Migration

```bash
# Check data integrity
node verify-migration.js
```

## Key Differences

### Database Schema Changes

| PostgreSQL | MongoDB | Notes |
|------------|---------|-------|
| `tenants` | `tenants` | Similar structure |
| `users` | `users` | Embedded roles array |
| `products` | `products` | Similar structure |
| `sales` | `sales` | Embedded items and payments |
| `sale_items` | Embedded in `sales` | No separate collection |
| `payments` | Embedded in `sales` | No separate collection |

### API Changes

| Old Endpoint | New Endpoint | Method | Notes |
|--------------|--------------|--------|-------|
| `/api/auth/login` | `/api/auth/login` | POST | Same endpoint |
| `/api/products` | `/api/products` | GET/POST | Similar structure |
| `/api/sales` | `/api/sales` | GET/POST | Enhanced with real-time updates |

### Authentication Changes

- **JWT tokens** remain the same format
- **Refresh token** mechanism improved
- **Permission system** now uses embedded roles

## Configuration

### Backend Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/algohub_pos
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AWS (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=algohub-pos-assets
```

### Frontend Environment Variables

```env
# API
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Deployment

### Production Build

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Docker Production

```bash
# Use production profile
docker-compose --profile production up -d

# Or with search and storage
docker-compose --profile production --profile search --profile storage up -d
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB is running: `docker-compose ps mongodb`
   - Verify connection string in `.env`
   - Check network connectivity

2. **Redis Connection Failed**
   - Check Redis is running: `docker-compose ps redis`
   - Verify Redis credentials
   - Check firewall settings

3. **Frontend Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript configuration
   - Verify environment variables

4. **Backend API Errors**
   - Check logs: `docker-compose logs backend`
   - Verify database connectivity
   - Check environment variables

### Performance Optimization

1. **Database Indexes**
   ```javascript
   // Ensure indexes are created
   db.products.createIndex({ tenantId: 1, sku: 1 })
   db.sales.createIndex({ tenantId: 1, createdAt: -1 })
   ```

2. **Redis Caching**
   - Enable Redis for session storage
   - Cache frequently accessed data
   - Use Redis for real-time features

3. **Frontend Optimization**
   - Enable code splitting
   - Use lazy loading for routes
   - Optimize bundle size

## Rollback Plan

If you need to rollback to the original system:

1. **Stop MERN services**
   ```bash
   docker-compose down
   ```

2. **Restore PostgreSQL data**
   ```bash
   psql -d algohub_pos < backup.sql
   ```

3. **Start original NestJS application**
   ```bash
   cd "E:\PROJECT MANAGEMET\POS PROJECT\backend"
   npm run start:prod
   ```

## Support

For migration issues:
1. Check this guide first
2. Review Docker logs: `docker-compose logs`
3. Check GitHub issues
4. Contact the development team

## Next Steps

After successful migration:
1. Monitor system performance
2. Train users on new features
3. Implement additional features
4. Set up monitoring and alerts
5. Plan for scalability improvements
