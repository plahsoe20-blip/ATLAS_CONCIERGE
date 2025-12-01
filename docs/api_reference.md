# ATLAS Platform API Reference

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.atlas-concierge.com/api`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": { ... }  // Optional
}
```

## HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+15551234567",
  "password": "SecurePassword123!",
  "role": "CONCIERGE"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CONCIERGE"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/profile
Get current user profile (Protected).

**Response (200):**
```json
{
  "user": {
    "id": "user_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "role": "CONCIERGE",
    "avatar": "",
    "settings": {
      "notifications": true,
      "darkMode": true
    }
  }
}
```

### PUT /auth/profile
Update user profile (Protected).

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+15559876543",
  "avatar": "https://example.com/avatar.jpg",
  "settings": {
    "notifications": false,
    "darkMode": true
  }
}
```

### POST /auth/change-password
Change user password (Protected).

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

---

## Booking Endpoints

### POST /bookings
Create a new booking request (Concierge only).

**Request Body:**
```json
{
  "type": "Hourly Charter",
  "vehicleCategory": "Luxury SUV",
  "details": {
    "pickupLocation": "123 Main St, New York, NY",
    "dropoffLocation": "456 Park Ave, New York, NY",
    "date": "2025-12-15",
    "time": "14:00",
    "durationHours": 4,
    "durationDays": 1,
    "distanceKm": 25,
    "passengerCount": 3,
    "luggageCount": 2,
    "preferences": {
      "temperature": "Cool (68°F)",
      "music": "Jazz",
      "beverages": ["Sparkling Water", "Coffee"]
    }
  }
}
```

**Response (201):**
```json
{
  "message": "Booking request created successfully",
  "booking": {
    "id": "booking_xyz789",
    "conciergeId": "user_abc123",
    "status": "SOURCING",
    "type": "Hourly Charter",
    "details": { ... },
    "estimatedPrice": 545.50,
    "createdAt": 1733011200000
  }
}
```

### GET /bookings
Get all bookings for current user (Protected).

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional, default: 50): Number of results
- `offset` (optional, default: 0): Pagination offset

**Response (200):**
```json
{
  "bookings": [
    {
      "id": "booking_xyz789",
      "status": "COMPLETED",
      "type": "Point-to-Point",
      "createdAt": 1733011200000,
      ...
    }
  ],
  "pagination": {
    "total": 24,
    "limit": 50,
    "offset": 0
  }
}
```

### GET /bookings/:id
Get specific booking details (Protected).

**Response (200):**
```json
{
  "booking": {
    "id": "booking_xyz789",
    "conciergeId": "user_abc123",
    "operatorId": "operator_def456",
    "driverId": "driver_ghi789",
    "vehicleId": "vehicle_jkl012",
    "status": "IN_PROGRESS",
    "type": "Hourly Charter",
    "details": { ... },
    "estimatedPrice": 545.50,
    "finalPrice": 545.50,
    "createdAt": 1733011200000
  }
}
```

### PUT /bookings/:id/status
Update booking status (Protected).

**Request Body:**
```json
{
  "status": "DRIVER_EN_ROUTE",
  "metadata": {
    "estimatedArrival": 1733015400000
  }
}
```

### POST /bookings/:id/cancel
Cancel a booking (Concierge only).

**Request Body:**
```json
{
  "reason": "Client schedule changed"
}
```

**Response (200):**
```json
{
  "message": "Booking cancelled successfully",
  "booking": {
    "id": "booking_xyz789",
    "status": "CANCELLED",
    "cancelledAt": 1733012000000,
    "cancellationReason": "Client schedule changed"
  }
}
```

### POST /bookings/:id/assign-driver
Assign driver to booking (Operator only).

**Request Body:**
```json
{
  "driverId": "driver_ghi789",
  "vehicleId": "vehicle_jkl012"
}
```

### POST /bookings/:id/accept
Accept booking assignment (Driver only).

**Response (200):**
```json
{
  "message": "Booking accepted",
  "booking": {
    "id": "booking_xyz789",
    "status": "DRIVER_EN_ROUTE"
  }
}
```

---

## Concierge Endpoints

### GET /concierge/dashboard
Get concierge dashboard statistics (Concierge only).

**Response (200):**
```json
{
  "stats": {
    "totalBookings": 24,
    "activeTrips": 2,
    "completedBookings": 20,
    "totalSpend": 12500.00,
    "thisMonthSpend": 3200.00
  }
}
```

### GET /concierge/bookings/:bookingId/quotes
Get quotes for a booking (Concierge only).

**Response (200):**
```json
{
  "quotes": [
    {
      "id": "quote_mno345",
      "bookingId": "booking_xyz789",
      "operatorId": "operator_def456",
      "vehicleId": "vehicle_jkl012",
      "price": 545.50,
      "eta": 15,
      "notes": "Premium Escalade with leather interior",
      "status": "PENDING",
      "createdAt": 1733011500000
    }
  ]
}
```

### POST /concierge/quotes/:quoteId/accept
Accept a quote (Concierge only).

**Response (200):**
```json
{
  "message": "Quote accepted successfully"
}
```

---

## Driver Endpoints

### GET /drivers/profile
Get driver profile (Driver only).

**Response (200):**
```json
{
  "driver": {
    "id": "driver_ghi789",
    "userId": "user_pqr123",
    "operatorId": "operator_def456",
    "status": "ONLINE",
    "licenseNumber": "NY-88210",
    "licenseExpiry": "2025-01-01",
    "rating": 4.9,
    "totalTrips": 142,
    "documents": {
      "license": true,
      "backgroundCheck": true,
      "insurance": true
    }
  },
  "user": { ... }
}
```

### PUT /drivers/status
Update driver status (Driver only).

**Request Body:**
```json
{
  "status": "ONLINE"
}
```

**Values:** `ONLINE`, `OFFLINE`, `BUSY`

### PUT /drivers/location
Update driver location (Driver only).

**Request Body:**
```json
{
  "lat": 40.7580,
  "lng": -73.9855,
  "heading": 180,
  "speed": 45.5
}
```

### GET /drivers/earnings
Get driver earnings (Driver only).

**Response (200):**
```json
{
  "earnings": {
    "today": 245.50,
    "thisWeek": 1250.75,
    "thisMonth": 4890.25,
    "totalTrips": 142,
    "rating": 4.9
  }
}
```

---

## Operator Endpoints

### GET /operators/profile
Get operator profile (Operator only).

**Response (200):**
```json
{
  "operator": {
    "id": "operator_def456",
    "userId": "user_stu456",
    "companyName": "Elite Transportation",
    "businessLicense": "BL-12345",
    "rating": 4.8,
    "totalBookings": 1250,
    "activeDrivers": 24,
    "activeVehicles": 30,
    "status": "ACTIVE"
  }
}
```

### GET /operators/dashboard
Get operator dashboard statistics (Operator only).

**Response (200):**
```json
{
  "stats": {
    "totalDrivers": 24,
    "onlineDrivers": 18,
    "totalVehicles": 30,
    "availableVehicles": 22,
    "activeBookings": 8,
    "totalBookings": 1250,
    "rating": 4.8
  }
}
```

### POST /operators/quotes
Submit a quote for a booking (Operator only).

**Request Body:**
```json
{
  "bookingId": "booking_xyz789",
  "vehicleId": "vehicle_jkl012",
  "price": 545.50,
  "eta": 15,
  "notes": "Premium Escalade with leather interior"
}
```

### GET /operators/fleet
Get operator's vehicle fleet (Operator only).

**Response (200):**
```json
{
  "vehicles": [
    {
      "id": "vehicle_jkl012",
      "operatorId": "operator_def456",
      "category": "Luxury SUV",
      "name": "Cadillac Escalade ESV",
      "plateNumber": "NY-ABC-1234",
      "maxPassengers": 6,
      "maxLuggage": 6,
      "status": "AVAILABLE",
      "features": ["Leather", "WiFi", "TV"]
    }
  ]
}
```

### POST /operators/fleet
Add a vehicle to fleet (Operator only).

**Request Body:**
```json
{
  "category": "Luxury SUV",
  "name": "Cadillac Escalade ESV",
  "plateNumber": "NY-ABC-1234",
  "maxPassengers": 6,
  "maxLuggage": 6,
  "image": "https://example.com/escalade.jpg",
  "features": ["Leather", "WiFi", "TV"]
}
```

### GET /operators/drivers
Get operator's drivers (Operator only).

**Response (200):**
```json
{
  "drivers": [
    {
      "id": "driver_ghi789",
      "userId": "user_pqr123",
      "operatorId": "operator_def456",
      "status": "ONLINE",
      "licenseNumber": "NY-88210",
      "rating": 4.9,
      "totalTrips": 142
    }
  ]
}
```

### POST /operators/drivers
Add a driver (Operator only).

**Request Body:**
```json
{
  "userId": "user_pqr123",
  "licenseNumber": "NY-88210",
  "licenseExpiry": "2025-12-31"
}
```

---

## Pricing Endpoints

### POST /pricing/calculate
Calculate quote for trip (Public).

**Request Body:**
```json
{
  "type": "Hourly Charter",
  "vehicleCategory": "Luxury SUV",
  "distanceKm": 25,
  "durationHours": 4,
  "durationDays": 1,
  "locationContext": "New York, NY"
}
```

**Response (200):**
```json
{
  "quote": {
    "subtotal": 500.00,
    "tax": 44.38,
    "platformFee": 25.00,
    "total": 569.38,
    "breakdown": {
      "baseFare": 0,
      "distanceFare": 0,
      "timeFare": 500.00
    },
    "driverPayout": 375.00,
    "platformRevenue": 25.00
  }
}
```

---

## Tracking Endpoints

### GET /tracking/driver/:driverId
Get driver's current location (Protected).

**Response (200):**
```json
{
  "location": {
    "lat": 40.7580,
    "lng": -73.9855,
    "heading": 180,
    "speed": 45.5,
    "timestamp": 1733012345678,
    "bookingId": "booking_xyz789"
  }
}
```

---

## WebSocket Events

### Client → Server

#### authenticate
```json
{
  "userId": "user_abc123",
  "role": "DRIVER"
}
```

#### location_update (Driver only)
```json
{
  "lat": 40.7580,
  "lng": -73.9855,
  "heading": 180,
  "speed": 45.5,
  "bookingId": "booking_xyz789"
}
```

#### booking_status
```json
{
  "bookingId": "booking_xyz789",
  "status": "DRIVER_EN_ROUTE"
}
```

#### send_message
```json
{
  "recipientId": "user_xyz789",
  "message": "I'm 5 minutes away"
}
```

### Server → Client

#### operator_notification (Operator only)
```json
{
  "type": "NEW_BOOKING_REQUEST",
  "booking": { ... }
}
```

#### driver_location
```json
{
  "driverId": "driver_ghi789",
  "bookingId": "booking_xyz789",
  "lat": 40.7580,
  "lng": -73.9855,
  "heading": 180,
  "speed": 45.5
}
```

#### booking_updated
```json
{
  "bookingId": "booking_xyz789",
  "status": "IN_PROGRESS"
}
```

#### new_message
```json
{
  "senderId": "user_abc123",
  "message": "I'm 5 minutes away",
  "timestamp": 1733012345678
}
```

---

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Exceeded limit returns `429 Too Many Requests`
- Consider authentication for higher limits

## Pagination
Endpoints that return lists support pagination:
- `limit`: Number of items (default: 50, max: 100)
- `offset`: Starting position (default: 0)

## Versioning
Current API version: v1
Future versions will be accessible via `/api/v2/...`

## Support
For API support, contact: api-support@atlas-concierge.com
