# ATLAS Concierge Backend

Enterprise-grade Node.js/Express backend for the ATLAS luxury transportation platform.

## Features

- ✅ RESTful API with Express
- ✅ JWT Authentication with bcrypt
- ✅ Role-based Access Control (RBAC)
- ✅ Real-time tracking with Socket.IO
- ✅ In-memory data storage (DynamoDB-ready)
- ✅ Comprehensive logging with Winston
- ✅ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ Input validation
- ✅ Error handling
- ✅ AWS-ready architecture

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **WebSocket**: Socket.IO 4.x
- **Authentication**: JWT + bcryptjs
- **Logging**: Winston
- **Security**: Helmet, CORS, Express Rate Limit
- **Validation**: Express Validator

## Prerequisites

- Node.js 18+ and npm
- Git

## Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your_client_id_here
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_location_id
GEMINI_API_KEY=your_gemini_api_key
LOG_LEVEL=info
```

## Running Locally

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

See [/docs/api_reference.md](../docs/api_reference.md) for complete API documentation.

### Base URL
```
http://localhost:5000/api
```

### Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-01T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## Project Structure

```
backend/
├── server.js                 # Main application entry point
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
├── config/
│   ├── index.js            # Configuration management
│   └── logger.js           # Winston logger setup
├── controllers/
│   ├── auth.controller.js      # Authentication logic
│   ├── booking.controller.js   # Booking management
│   ├── concierge.controller.js # Concierge operations
│   ├── driver.controller.js    # Driver operations
│   └── operator.controller.js  # Operator operations
├── models/
│   └── index.js            # Data models (In-memory/DynamoDB)
├── routes/
│   ├── auth.routes.js         # Auth endpoints
│   ├── booking.routes.js      # Booking endpoints
│   ├── concierge.routes.js    # Concierge endpoints
│   ├── driver.routes.js       # Driver endpoints
│   ├── operator.routes.js     # Operator endpoints
│   ├── pricing.routes.js      # Pricing calculations
│   └── tracking.routes.js     # Real-time tracking
├── middleware/
│   ├── auth.js             # JWT verification & RBAC
│   ├── errorHandler.js     # Global error handling
│   └── requestLogger.js    # Request/response logging
├── services/
│   ├── pricing.service.js  # Pricing engine
│   └── socket.service.js   # WebSocket handlers
└── utils/
    └── (utility functions)
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "password": "SecurePassword123!",
    "role": "CONCIERGE"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### Using the Token
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Roles

- `CONCIERGE`: Premium clients who create bookings
- `OPERATOR`: Fleet operators who manage drivers/vehicles
- `DRIVER`: Drivers who fulfill bookings
- `ADMIN`: Platform administrators

## WebSocket Events

Connect to WebSocket: `ws://localhost:5000`

### Client Events
- `authenticate`: Authenticate WebSocket connection
- `location_update`: Driver sends GPS updates
- `booking_status`: Update booking status
- `send_message`: Send chat message

### Server Events
- `operator_notification`: New booking requests (Operators)
- `driver_location`: Live driver GPS updates
- `booking_updated`: Booking status changes
- `new_message`: Incoming chat messages

Example:
```javascript
const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', {
  userId: 'user_123',
  role: 'DRIVER'
});

// Send location update
socket.emit('location_update', {
  lat: 40.7580,
  lng: -73.9855,
  heading: 180,
  speed: 45.5,
  bookingId: 'booking_456'
});

// Listen for updates
socket.on('booking_updated', (data) => {
  console.log('Booking updated:', data);
});
```

## Testing

### Manual API Testing with curl

**Create a booking:**
```bash
# First, login and get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | jq -r '.token')

# Create booking
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
      "passengerCount": 3
    }
  }'
```

### Using Postman

Import the Postman collection (coming soon) or manually create requests using the API Reference.

## Logging

Logs are written to:
- `logs/combined.log`: All logs
- `logs/error.log`: Error logs only
- Console (development mode)

Log levels: `error`, `warn`, `info`, `http`, `debug`

## Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection

## Performance

- Stateless architecture (horizontally scalable)
- In-memory storage for development
- DynamoDB-ready for production
- Connection pooling
- Request/response compression

## Deployment

### Local Production Mode
```bash
NODE_ENV=production npm start
```

### AWS Lambda
See [/docs/aws_deployment_plan.md](../docs/aws_deployment_plan.md)

```bash
# Package for Lambda
npm install --production
zip -r atlas-backend.zip . -x "*.git*" "node_modules/aws-sdk/*"

# Deploy
aws lambda update-function-code \
  --function-name atlas-api \
  --zip-file fileb://atlas-backend.zip
```

### Docker (Alternative)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
docker build -t atlas-backend .
docker run -p 5000:5000 --env-file .env atlas-backend
```

## Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs
```bash
# View real-time logs
tail -f logs/combined.log

# View errors only
tail -f logs/error.log
```

### CloudWatch (AWS)
Logs are automatically sent to CloudWatch when deployed on Lambda.

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Errors
Ensure `FRONTEND_URL` in `.env` matches your frontend URL.

### JWT Token Errors
- Check `JWT_SECRET` is set correctly
- Verify token hasn't expired (24h default)
- Ensure token is sent in `Authorization: Bearer <token>` header

### Database Connection Issues
Current version uses in-memory storage. No database connection required for local development.

## Migration to DynamoDB

When ready for production:

1. Update `config/index.js`:
```javascript
database: {
  type: 'dynamodb',  // Change from 'memory'
  region: process.env.AWS_REGION
}
```

2. Install AWS SDK:
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

3. Update models to use DynamoDB operations
4. Create tables using scripts in `/docs/aws_deployment_plan.md`

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## Support

For technical support:
- Email: backend-support@atlas-concierge.com
- Documentation: /docs
- GitHub Issues: (repository URL)

## License

Proprietary - ATLAS Concierge Platform
