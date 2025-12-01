# ATLAS Concierge Platform - Quick Start Guide

Welcome to the ATLAS Concierge Platform! This guide will help you get up and running in minutes.

---

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Terminal/command line access
- ✅ Text editor (VS Code recommended)

---

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

This installs:
- Express.js (web framework)
- Socket.IO (real-time communication)
- JWT & bcrypt (authentication)
- Winston (logging)
- And 15+ other enterprise packages

### Frontend
```bash
cd ..
npm install
```

This installs:
- React 19.2 (UI framework)
- Vite (build tool)
- TypeScript (type safety)
- Lucide icons
- And dependencies

---

## Step 2: Configure Environment

### Backend Configuration
```bash
cd backend
cp .env.example .env
nano .env  # or use your preferred editor
```

**Minimum required settings:**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=change_this_to_a_random_32_character_string_minimum
```

**Optional (for full functionality):**
```env
SQUARE_ACCESS_TOKEN=your_square_sandbox_token
SQUARE_LOCATION_ID=your_square_location_id
GEMINI_API_KEY=your_gemini_api_key_for_ai_assistant
```

### Frontend Configuration
```bash
cd ..
cp .env.local.example .env.local 2>/dev/null || echo "GEMINI_API_KEY=your_key_here" > .env.local
nano .env.local
```

**Required:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Step 3: Start the Platform

### Terminal 1 - Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
🚀 ATLAS Backend Server running on port 5000
Environment: development
WebSocket enabled for real-time tracking
```

**Test it:**
```bash
# In a new terminal
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-01T...",
  "uptime": 123.45,
  "environment": "development"
}
```

### Terminal 2 - Start Frontend
```bash
npm run dev
```

You should see:
```
VITE v6.2.0  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

## Step 4: Access the Platform

Open your browser to: **http://localhost:3000**

### Login Flow

The app starts at the login page. You can test with different roles:

**Role Selection:**
1. Click on one of the role buttons:
   - **CONCIERGE** - For clients creating bookings
   - **OPERATOR** - For fleet operators
   - **DRIVER** - For drivers

2. You'll be automatically logged in (demo mode)

---

## Step 5: Test Core Features

### As Concierge (Client)
1. Click "New Booking" in sidebar
2. Fill out booking form:
   - Service Type: Hourly Charter
   - Pickup: Times Square, NYC
   - Date/Time: Choose future date
   - Duration: 4 hours
   - Vehicle: Luxury SUV
   - Passengers: 3
3. Click "Calculate Quote"
4. Review pricing breakdown
5. Click "Create Booking"
6. Navigate to "Sourcing" to see operators respond

### As Operator
1. Login as OPERATOR
2. View "Dashboard" for stats
3. Click "Fleet Management" to see vehicles
4. Click "Drivers" to manage driver roster
5. When a booking comes in, you'll see it in marketplace
6. Submit a quote with your pricing

### As Driver
1. Login as DRIVER
2. View assigned jobs on dashboard
3. Accept a job
4. GPS simulation starts automatically
5. Update status: En Route → Arrived → In Progress → Complete
6. View earnings summary

---

## Step 6: Test API Directly

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "password": "SecurePass123!",
    "role": "CONCIERGE"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Save the token from response.

### Get Profile (Protected Route)
```bash
TOKEN="your_jwt_token_from_login_response"

curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Create a Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Hourly Charter",
    "vehicleCategory": "Luxury SUV",
    "details": {
      "pickupLocation": "Times Square, NYC",
      "date": "2025-12-15",
      "time": "14:00",
      "durationHours": 4,
      "passengerCount": 3,
      "distanceKm": 0
    }
  }'
```

---

## Step 7: Test WebSocket (Real-Time)

### Using Browser Console
```javascript
// Connect to WebSocket
const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', {
  userId: 'user_123',
  role: 'DRIVER'
});

// Send location update (as driver)
socket.emit('location_update', {
  lat: 40.7580,
  lng: -73.9855,
  heading: 180,
  speed: 45.5,
  bookingId: 'booking_456'
});

// Listen for updates
socket.on('booking_updated', (data) => {
  console.log('Booking update:', data);
});

socket.on('driver_location', (data) => {
  console.log('Driver location:', data);
});
```

---

## Troubleshooting

### Backend Won't Start

**Error: Port 5000 already in use**
```bash
# Find process using port 5000
lsof -i :5000
# Kill it
kill -9 <PID>
```

**Error: Cannot find module**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Won't Start

**Error: Command not found**
```bash
# Make sure you're in the root directory
cd /workspaces/ATLAS_CONCIERGE
npm install
```

**Error: Cannot connect to backend**
- Check backend is running on port 5000
- Check `.env.local` has correct API URL
- Check browser console for CORS errors

### Database Errors

Don't worry! The platform uses in-memory storage for local development. No database setup required.

### Authentication Errors

**Invalid token:**
- Token expires after 24 hours
- Login again to get a new token
- Check `JWT_SECRET` is set in backend `.env`

---

## Next Steps

### Learn More
- **Architecture:** Read `/docs/architecture.md`
- **API Reference:** Read `/docs/api_reference.md`
- **Data Models:** Read `/docs/data_models.md`

### Customize
1. Modify pricing rules in `/backend/services/pricing.service.js`
2. Add new vehicle categories in `/constants.ts`
3. Customize UI theme in `/App.tsx`
4. Add new API endpoints following existing patterns

### Deploy to Production
Follow the comprehensive guide in `/docs/aws_deployment_plan.md`

---

## Key URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/health |
| API Docs | `/docs/api_reference.md` |

---

## Support

### Documentation
- 📖 [README.md](../README.md) - Main overview
- 📖 [PROJECT_STATUS.md](../PROJECT_STATUS.md) - Completion report
- 📖 [Backend README](../backend/README.md) - Backend guide
- 📖 [Architecture](../docs/architecture.md) - System design
- 📖 [API Reference](../docs/api_reference.md) - API docs

### Getting Help
- Check logs in `backend/logs/`
- Review error messages carefully
- Consult troubleshooting guides in docs
- Check GitHub issues (if applicable)

---

## Quick Reference

### Start Everything
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Stop Everything
- Press `Ctrl+C` in both terminals

### Reset Everything
```bash
# Backend
cd backend
rm -rf node_modules logs
npm install

# Frontend
cd ..
rm -rf node_modules
npm install
```

### View Logs
```bash
# Real-time logs
tail -f backend/logs/combined.log

# Errors only
tail -f backend/logs/error.log
```

---

## Success Checklist

After following this guide, you should have:

- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ Health check returns "healthy"
- ✅ Can login to different roles
- ✅ Can create bookings
- ✅ Can see real-time updates
- ✅ API responds to curl commands
- ✅ WebSocket connection works

---

**Congratulations!** 🎉 

You're now running the ATLAS Concierge Platform locally. The platform features enterprise-grade architecture, real-time tracking, secure authentication, and is ready for AWS deployment.

For production deployment, see `/docs/aws_deployment_plan.md`.

**Happy building!** 🚀
