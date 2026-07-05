# AlgoHub POS - MERN Stack Migration

This project is a complete migration of the AlgoHub POS system from NestJS/PostgreSQL to a modern MERN stack (MongoDB, Express.js, React, Node.js).

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                       │
│  React + TypeScript | Redux Toolkit | TanStack Query        │
│  Tailwind CSS       | Socket.IO Client | PWA                │
├─────────────────────────────────────────────────────────────┤
│                    API LAYER (Express.js)                    │
│            Express.js + TypeScript + Socket.IO              │
├─────────────────────────────────────────────────────────────┤
│                  BACKEND (Node.js 20 LTS)                    │
│  Express.js | JWT Authentication | Bull Queues              │
│  Mongoose ODM | Redis Cache | Socket.IO                     │
├─────────────────────────────────────────────────────────────┤
│                    DATABASE & STORAGE                        │
│  MongoDB (Primary) | Redis (Cache) | AWS S3 (Assets)       │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
POS_MERNSTACK/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── app.ts          # Express app setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   ├── utils/          # Helper functions
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
├── shared/                 # Shared types and utilities
│   └── types/              # TypeScript interfaces
├── scripts/                # Migration and utility scripts
├── docs/                   # Documentation
└── docker-compose.yml      # Development environment
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 6+
- Redis 7+
- Docker & Docker Compose (optional)

### Development Setup

1. **Clone and install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Environment Configuration**
```bash
# Backend environment
cd backend
cp .env.example .env
# Configure your database and JWT settings

# Frontend environment
cd ../frontend
cp .env.example .env
# Configure API endpoints
```

3. **Start Development Servers**
```bash
# Start backend (port 3001)
cd backend
npm run dev

# Start frontend (port 3000)
cd ../frontend
npm run dev
```

### Docker Development
```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 Features

### Core Features
- ✅ Multi-tenant architecture
- ✅ User authentication & authorization
- ✅ POS transactions & sales management
- ✅ Inventory management
- ✅ Purchase orders
- ✅ Financial accounting
- ✅ Real-time notifications
- ✅ Reporting & analytics
- ✅ Audit logging

### Technical Features
- ✅ TypeScript support
- ✅ Real-time WebSocket connections
- ✅ Redis caching
- ✅ Queue-based job processing
- ✅ File uploads to AWS S3
- ✅ PWA support
- ✅ Responsive design
- ✅ Dark mode support

## 🔄 Migration Status

This is a complete migration from the original NestJS/PostgreSQL system. Key changes:

- **Database**: PostgreSQL → MongoDB with Mongoose ODM
- **Backend**: NestJS → Express.js with TypeScript
- **Authentication**: Passport JWT → Custom JWT middleware
- **Real-time**: NestJS WebSockets → Socket.IO
- **Frontend**: Same React stack with improved state management

## 📚 API Documentation

API endpoints are documented using Swagger/OpenAPI. Access the documentation at:
`http://localhost:3001/api-docs`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Build
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

### Environment Variables
See `.env.example` files in both backend and frontend for required environment variables.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.
## Production Deployment

### Backend on Render

Use `backend` as the Render root directory.

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Runtime: Node.js 20+
- Health check path: `/health`

Required backend environment variables:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=<mongodb-atlas-or-render-private-uri>
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-refresh-secret>
CORS_ORIGINS=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

Optional service variables are listed in `backend/.env.example` for Redis, S3, email, queues, and uploads.

Current backend blocker: `backend/src/app.ts` imports `./routes/auth-simple`, but that file does not exist. Because authentication is protected for this audit, the route wiring was not changed.

### Frontend on Vercel

Use `frontend` as the Vercel root directory.

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite

Required frontend environment variables:

```bash
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
VITE_SOCKET_URL=https://your-render-service.onrender.com
VITE_APP_NAME=AlgoHub POS
VITE_APP_VERSION=1.0.0
VITE_ENABLE_PWA=true
VITE_ENABLE_DEBUG=false
VITE_ENABLE_SOURCEMAPS=false
```

After deploying the frontend, add its Vercel URL to the backend `CORS_ORIGINS` value on Render.
