# ATLAS Concierge Platform - Architecture Documentation

## Overview
ATLAS is an enterprise-grade luxury ground transportation concierge platform connecting high-net-worth individuals with premium operators and drivers. The system is built with a FAANG-level architecture emphasizing scalability, security, and real-time communication.

## System Architecture

### High-Level Architecture
```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React SPA     │◄────►│  Express API     │◄────►│   Data Layer    │
│   (Frontend)    │      │   (Backend)      │      │  (DynamoDB)     │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                         │
        │                         │
        └────────────┬────────────┘
                     │
               ┌─────▼──────┐
               │  WebSocket │
               │  Socket.IO │
               └────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 6.2
- **State Management**: Context API with custom hooks
- **UI Components**: Custom component library with Tailwind CSS
- **Real-time**: Socket.IO Client
- **AI Integration**: Google Gemini API

#### Backend
- **Runtime**: Node.js with ES Modules
- **Framework**: Express 4.x
- **WebSocket**: Socket.IO 4.x
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validation**: Joi/Express-Validator

#### Infrastructure (AWS Ready)
- **Compute**: AWS Lambda + API Gateway
- **Storage**: DynamoDB
- **Auth**: AWS Cognito
- **Frontend Hosting**: S3 + CloudFront
- **Real-time**: AWS AppSync or self-hosted Socket.IO
- **Payments**: Square API

## Core Modules

### 1. Authentication & Authorization
- Role-based access control (RBAC)
- JWT token-based authentication
- Password hashing with bcrypt
- Session management
- Ready for AWS Cognito migration

**Roles:**
- `CONCIERGE`: Premium clients creating bookings
- `OPERATOR`: Fleet operators managing drivers and vehicles
- `DRIVER`: Drivers accepting and completing trips
- `ADMIN`: Platform administrators

### 2. Booking Engine
**Booking Lifecycle State Machine:**
```
NEW → SOURCING → QUOTING → OPERATOR_ASSIGNED → 
DRIVER_ASSIGNED → DRIVER_EN_ROUTE → ARRIVED → 
IN_PROGRESS → COMPLETED → PAID
```

**Alternative States:**
- `CANCELLED`: User or system cancellation
- `EXPIRED`: Quote expiration without acceptance

### 3. Operator Assignment System
- Marketplace model: operators submit competitive quotes
- Automatic broadcasting to qualified operators
- Quote comparison with best-value algorithm
- Operator rating and history tracking

### 4. Real-Time Tracking
- WebSocket-based live location updates
- Driver GPS streaming (1-second intervals)
- Route visualization with polylines
- ETA calculation and updates
- Status change notifications

### 5. Pricing Engine
**Service Types:**
- Point-to-Point (P2P)
- Hourly Charter
- Multi-Day Charter
- Airport Transfers

**Vehicle Categories:**
- Luxury Sedan (Mercedes S-Class, BMW 7)
- Luxury SUV (Escalade, Navigator)
- Executive Sprinter (12-passenger)
- First-Class Limo (Rolls Royce, Bentley)

**Pricing Components:**
- Base fare
- Distance-based pricing (per km)
- Time-based pricing (hourly)
- Location-based tax calculation
- Platform fee (5%)
- Driver commission (70-80%)

### 6. Payment Processing
- Square integration (sandbox + production)
- Pre-authorization on booking
- Automatic capture on completion
- Refund handling for cancellations
- Invoice generation
- Ready for Stripe integration

### 7. VIP Preferences
- Driver gender preference
- Temperature settings
- Music preferences
- Beverage requests
- Special instructions
- Accessibility requirements

## Data Models

### User
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  passwordHash: string,
  role: UserRole,
  avatar: string,
  settings: Object,
  createdAt: timestamp,
  lastLogin: timestamp,
  status: 'ACTIVE' | 'SUSPENDED'
}
```

### Booking
```javascript
{
  id: string,
  conciergeId: string,
  operatorId: string,
  driverId: string,
  vehicleId: string,
  status: BookingStatus,
  type: BookingType,
  details: {
    pickupLocation: string,
    dropoffLocation: string,
    date: string,
    time: string,
    passengerCount: number,
    luggageCount: number,
    preferences: VIPPreferences,
    itinerary: ItineraryDay[]
  },
  estimatedPrice: number,
  finalPrice: number,
  selectedQuoteId: string,
  paymentStatus: string,
  transactionId: string,
  createdAt: timestamp,
  completedAt: timestamp
}
```

### Driver
```javascript
{
  id: string,
  userId: string,
  operatorId: string,
  status: 'ONLINE' | 'OFFLINE' | 'BUSY',
  licenseNumber: string,
  licenseExpiry: string,
  rating: number,
  totalTrips: number,
  documents: {
    license: boolean,
    backgroundCheck: boolean,
    insurance: boolean
  },
  currentLocation: GeoPoint,
  currentBookingId: string
}
```

### Vehicle
```javascript
{
  id: string,
  operatorId: string,
  category: VehicleCategory,
  name: string,
  plateNumber: string,
  maxPassengers: number,
  maxLuggage: number,
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE',
  features: string[],
  image: string
}
```

## Security Features

### Authentication
- bcrypt password hashing (12 rounds)
- JWT tokens with expiration
- Refresh token rotation
- Role-based middleware protection

### API Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 req/15min per IP)
- Input sanitization
- SQL injection prevention (parameterized queries)
- XSS protection

### Data Security
- Passwords never stored in plain text
- Sensitive data encryption at rest (ready for KMS)
- HTTPS-only in production
- Environment variable management
- Audit logging of all transactions

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- WebSocket session management with Redis (ready)
- Load balancer compatible
- Microservices-ready architecture

### Performance Optimization
- Database indexing strategies
- Caching layer (Redis ready)
- CDN for static assets
- API response pagination
- Lazy loading on frontend

### Monitoring & Observability
- Structured logging with Winston
- Request/response tracking
- Error tracking and alerting
- Performance metrics
- Health check endpoints

## Development Workflow

### Local Development
1. Backend runs on `localhost:5000`
2. Frontend runs on `localhost:3000`
3. WebSocket connects to backend
4. In-memory data storage (no database required)

### Production Deployment
1. Frontend → AWS S3 + CloudFront
2. Backend → AWS Lambda + API Gateway
3. Database → DynamoDB
4. Auth → AWS Cognito
5. WebSocket → Self-hosted or AWS AppSync
6. Monitoring → CloudWatch

## API Versioning
- Current version: v1
- URL structure: `/api/v1/{resource}`
- Backward compatibility maintained
- Deprecation notices with 6-month sunset

## Error Handling
- Standardized error responses
- HTTP status codes properly used
- Detailed error messages in development
- Generic messages in production
- Error logging and tracking

## Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Load testing for scalability validation
- Security penetration testing

## Future Enhancements
- Mobile apps (iOS/Android)
- Push notifications
- AI-powered route optimization
- Predictive pricing
- Driver dashcam integration
- Blockchain payment options
- Multi-language support
- White-label solutions for operators
