# ATLAS Concierge Platform

Enterprise-grade luxury ground transportation concierge platform built with FAANG-level engineering standards.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19.2.0-blue)](https://reactjs.org/)

---

## 🌟 Overview

ATLAS is a comprehensive platform connecting premium concierge services with luxury transportation operators and professional drivers. Built with modern cloud-native architecture, real-time capabilities, and enterprise security standards.

### Key Features

✅ **Multi-Role Platform**
- Concierge Dashboard (Client bookings & trip management)
- Operator Dashboard (Fleet & driver management, quote submission)
- Driver Dashboard (Job acceptance, navigation, earnings)
- Admin Dashboard (Platform oversight)

✅ **Real-Time Tracking**
- Live GPS tracking via WebSocket
- Route visualization
- ETA calculations
- Status notifications

✅ **Intelligent Pricing Engine**
- Point-to-Point pricing
- Hourly charter pricing
- Multi-day bookings
- Dynamic tax calculation
- Vehicle category pricing (Sedan, SUV, Sprinter, Limo)

✅ **Marketplace System**
- Operator quote submission
- Competitive bidding
- Best-value recommendations
- Operator rating system

✅ **Enterprise Backend**
- RESTful API with Express.js
- JWT authentication & RBAC
- Real-time WebSocket support
- Comprehensive logging
- Security middleware
- AWS-ready architecture

✅ **Payment Processing**
- Square integration (ready)
- Pre-authorization
- Automatic capture
- Invoice generation

✅ **AI Integration**
- Google Gemini API for concierge assistance
- Natural language booking queries
- Intelligent recommendations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Configuration

**Frontend (.env.local):**
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

**Backend (backend/.env):**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
SQUARE_ACCESS_TOKEN=your_square_access_token
GEMINI_API_KEY=your_gemini_api_key
```

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`

### Health Check
```bash
curl http://localhost:5000/health
```

---

## 📖 Documentation

Comprehensive documentation available in `/docs`:

- **[Architecture Guide](docs/architecture.md)** - System design, tech stack, scalability
- **[API Reference](docs/api_reference.md)** - Complete API documentation
- **[Data Models](docs/data_models.md)** - Database schema and relationships
- **[AWS Deployment](docs/aws_deployment_plan.md)** - Production deployment guide
- **[Backend README](backend/README.md)** - Backend-specific documentation

---

## 🏗️ Architecture

**Technology Stack:**
- **Frontend**: React 19.2, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js 18+, Express 4.x, Socket.IO 4.x
- **Database**: DynamoDB (in-memory for local dev)
- **Auth**: JWT (AWS Cognito ready)
- **Deployment**: AWS Lambda, S3, CloudFront
- **Real-time**: WebSocket via Socket.IO

---

## 🔐 Authentication & Roles

| Role | Permissions |
|------|-------------|
| **CONCIERGE** | Create bookings, track trips, view history, AI assistant |
| **OPERATOR** | Manage fleet, assign drivers, submit quotes, view revenue |
| **DRIVER** | Accept jobs, update status, navigation, earnings |
| **ADMIN** | Full platform access, user management |

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🆘 Support

- Technical Support: support@atlas-concierge.com
- API Support: api-support@atlas-concierge.com
- Documentation: See `/docs` folder

---

**ATLAS** - *Elevating Ground Transportation to Unprecedented Heights*

Built with ❤️ for luxury concierge services worldwide.
