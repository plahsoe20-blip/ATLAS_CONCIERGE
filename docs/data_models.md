# Data Models Documentation

## Overview
ATLAS platform uses a normalized relational data model optimized for DynamoDB and in-memory storage.

## Core Entities

### User
Represents all platform users regardless of role.

```typescript
{
  id: string;                    // Primary key (UUID)
  name: string;                  // Full name
  email: string;                 // Unique email (GSI)
  phone: string;                 // Phone number
  passwordHash: string;          // bcrypt hash
  role: UserRole;                // CONCIERGE | OPERATOR | DRIVER | ADMIN
  avatar: string;                // Profile image URL
  settings: {
    notifications: boolean;
    darkMode: boolean;
  };
  createdAt: timestamp;          // Account creation
  updatedAt: timestamp;          // Last profile update
  lastLogin: timestamp | null;   // Last successful login
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}
```

**Indexes:**
- Primary: `id`
- GSI: `email` (unique lookup)

**Relationships:**
- One User → One Concierge Profile (optional)
- One User → One Operator Profile (optional)
- One User → One Driver Profile (optional)

---

### Booking
Core business entity tracking trip requests and fulfillment.

```typescript
{
  id: string;                    // Primary key (UUID)
  conciergeId: string;           // FK to User (GSI)
  operatorId: string | null;     // FK to Operator (GSI)
  driverId: string | null;       // FK to Driver (GSI)
  vehicleId: string | null;      // FK to Vehicle
  status: BookingStatus;         // State machine value
  type: BookingType;             // P2P | HOURLY | AIRPORT
  details: {
    pickupLocation: string;
    dropoffLocation: string;
    date: string;                // ISO 8601
    time: string;                // HH:mm
    durationHours: number;
    durationDays: number;
    distanceKm: number;
    passengerCount: number;
    luggageCount: number;
    preferences: VIPPreferences;
    itinerary: ItineraryDay[];
  };
  estimatedPrice: number;        // Initial quote
  finalPrice: number | null;     // Accepted quote amount
  selectedQuoteId: string | null; // FK to Quote
  paymentStatus: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'REFUNDED';
  transactionId: string | null;  // FK to Transaction
  createdAt: timestamp;          // Request creation
  updatedAt: timestamp;          // Last status change
  completedAt: timestamp | null; // Trip completion
  cancelledAt: timestamp | null; // Cancellation time
  cancellationReason: string | null;
}
```

**Indexes:**
- Primary: `id`
- GSI1: `conciergeId` + `createdAt` (sort)
- GSI2: `operatorId` + `createdAt` (sort)
- GSI3: `driverId` + `createdAt` (sort)

**State Machine:**
```
NEW → SOURCING → QUOTING → OPERATOR_ASSIGNED → 
DRIVER_ASSIGNED → DRIVER_EN_ROUTE → ARRIVED → 
PASSENGER_ONBOARD → IN_PROGRESS → COMPLETED → PAID
```

Alternative paths:
- `CANCELLED` (from any state)
- `EXPIRED` (from QUOTING)

---

### Driver
Extended profile for users with DRIVER role.

```typescript
{
  id: string;                    // Primary key (UUID)
  userId: string;                // FK to User
  operatorId: string;            // FK to Operator (GSI)
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  licenseNumber: string;
  licenseExpiry: string;         // ISO 8601 date
  rating: number;                // 0.0-5.0
  totalTrips: number;            // Completed trip count
  documents: {
    license: boolean;            // Verified
    backgroundCheck: boolean;    // Passed
    insurance: boolean;          // Active
  };
  currentLocation: {
    lat: number;
    lng: number;
    heading: number;             // 0-360 degrees
    speed: number;               // km/h
    timestamp: timestamp;
  } | null;
  currentBookingId: string | null; // FK to active Booking
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Indexes:**
- Primary: `id`
- GSI: `operatorId` (list operator's drivers)
- LSI: `userId` (lookup by user)

---

### Vehicle
Fleet vehicles owned by operators.

```typescript
{
  id: string;                    // Primary key (UUID)
  operatorId: string;            // FK to Operator (GSI)
  category: VehicleCategory;     // SEDAN | SUV | SPRINTER | LIMO
  name: string;                  // e.g., "Cadillac Escalade ESV"
  plateNumber: string;           // License plate
  maxPassengers: number;
  maxLuggage: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE';
  features: string[];            // ["Leather", "WiFi", "TV"]
  image: string;                 // Vehicle photo URL
  currentDriverId: string | null; // FK to Driver
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Indexes:**
- Primary: `id`
- GSI: `operatorId` (list operator's fleet)

---

### Operator
Extended profile for users with OPERATOR role.

```typescript
{
  id: string;                    // Primary key (UUID)
  userId: string;                // FK to User (LSI)
  companyName: string;
  businessLicense: string;
  rating: number;                // 0.0-5.0
  totalBookings: number;         // Completed
  activeDrivers: number;         // Count cache
  activeVehicles: number;        // Count cache
  pricingRules: Record<VehicleCategory, PricingRule>;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Indexes:**
- Primary: `id`
- LSI: `userId` (lookup by user)

---

### Quote
Operator bids on booking requests.

```typescript
{
  id: string;                    // Primary key (UUID)
  bookingId: string;             // FK to Booking (GSI)
  operatorId: string;            // FK to Operator
  vehicleId: string;             // FK to Vehicle
  price: number;                 // Total quote amount
  eta: number;                   // Minutes to pickup
  notes: string;                 // Additional info
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  createdAt: timestamp;
  updatedAt: timestamp;
  expiresAt: timestamp;          // Quote expiration
}
```

**Indexes:**
- Primary: `id`
- GSI: `bookingId` + `createdAt` (sort by time)

---

### Transaction
Payment records for bookings.

```typescript
{
  id: string;                    // Primary key (UUID)
  bookingId: string;             // FK to Booking (GSI)
  amount: number;                // USD cents
  status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'REFUNDED' | 'FAILED';
  method: 'CARD' | 'INVOICE' | 'WIRE';
  paymentGatewayId: string | null; // Square Payment ID
  metadata: {
    cardLast4?: string;
    cardBrand?: string;
    receiptUrl?: string;
  };
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Indexes:**
- Primary: `id`
- GSI: `bookingId` (lookup booking payment)

---

## Supporting Types

### VIPPreferences
```typescript
{
  preferredDriverGender?: 'Male' | 'Female' | 'Any';
  temperature?: 'Cool (68°F)' | 'Ambient (72°F)' | 'Warm (76°F)';
  music?: 'Silence' | 'Jazz' | 'Classical' | 'Pop' | 'Radio' | 'Client Aux';
  beverages?: string[];          // ["Sparkling Water", "Coffee"]
  meetAndGreet?: boolean;
  rampAccess?: boolean;
  quietRide?: boolean;
  specialInstructions?: string;
}
```

### ItineraryDay
For multi-day bookings.
```typescript
{
  dayNumber: number;             // 1, 2, 3...
  date: string;                  // ISO 8601
  time: string;                  // HH:mm
  hours: number;                 // Duration
  pickupLocation: string;
  dropoffLocation?: string;
  notes?: string;
}
```

### PricingRule
Per-operator, per-vehicle-category pricing.
```typescript
{
  vehicleCategory: VehicleCategory;
  hourlyRate: number;            // USD per hour
  baseP2P: number;               // Base P2P fare
  perKm: number;                 // Rate per kilometer
  minHours: number;              // Minimum booking hours
  driverCommissionPct: number;   // 0.0-1.0 (e.g., 0.75 = 75%)
  taxRate: number;               // Location-based tax
}
```

---

## Data Access Patterns

### 1. Concierge View Their Bookings
```
Query: GSI1 (conciergeId + createdAt)
Params: conciergeId = "user_123"
Sort: Descending by createdAt
Limit: 50
```

### 2. Operator View Incoming Quotes
```
Query: Bookings with status=SOURCING or QUOTING
Filter: Bookings without operatorId
Index: Status + CreatedAt GSI (if implemented)
```

### 3. Driver View Assigned Jobs
```
Query: GSI3 (driverId + createdAt)
Params: driverId = "driver_456"
Filter: status IN [DRIVER_ASSIGNED, DRIVER_EN_ROUTE, IN_PROGRESS]
Sort: Ascending by pickup time
```

### 4. Get Quotes for Booking
```
Query: GSI on bookingId
Params: bookingId = "booking_789"
Filter: status = PENDING
Sort: Ascending by price (best value first)
```

### 5. Real-Time Driver Location
```
Get: Driver by ID
Access: currentLocation object
Update: via WebSocket (not persistent query)
```

---

## Migration from In-Memory to DynamoDB

### Current (Development)
```javascript
const bookings = new Map();
bookings.set(id, booking);
const result = bookings.get(id);
```

### Future (Production)
```javascript
import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

// Put
await client.send(new PutItemCommand({
  TableName: "atlas-bookings",
  Item: marshall(booking)
}));

// Get
const result = await client.send(new GetItemCommand({
  TableName: "atlas-bookings",
  Key: { id: { S: bookingId } }
}));
```

---

## Backup & Recovery

### Point-in-Time Recovery
Enable on all DynamoDB tables:
```bash
aws dynamodb update-continuous-backups \
  --table-name atlas-bookings \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### Daily Backups
Automated via AWS Backup:
- Retention: 30 days
- Lifecycle: Transition to cold storage after 7 days

---

## Data Retention Policy

| Entity | Retention | Archive |
|--------|-----------|---------|
| Users | Indefinite | N/A |
| Bookings | 7 years | S3 Glacier after 2 years |
| Transactions | 10 years | Required by law |
| Quotes | 90 days | Delete after expiration |
| Logs | 30 days | CloudWatch + S3 |

---

## Compliance

### GDPR (Europe)
- Right to access: Export user data API
- Right to deletion: Anonymize, don't delete bookings
- Data portability: JSON export

### PCI DSS (Payments)
- Never store card numbers
- Use tokenization (Square)
- Encrypt sensitive data at rest

### SOC 2
- Audit logs for all data access
- Encryption in transit (TLS 1.3)
- Role-based access control

---

## Performance Considerations

### Caching Strategy
- User profiles: Redis (5 min TTL)
- Active bookings: Redis (1 min TTL)
- Pricing rules: Redis (1 hour TTL)

### Read/Write Patterns
- Bookings: Write-heavy during creation, read-heavy during tracking
- Users: Read-heavy
- Locations: Write-heavy (every second), ephemeral

### Capacity Planning
- Bookings Table: 100 WCU, 500 RCU (with auto-scaling)
- Users Table: 10 WCU, 50 RCU
- Enable DynamoDB Accelerator (DAX) for sub-millisecond reads

---

## Schema Evolution

Version all schemas with `schemaVersion` field:
```typescript
{
  id: "booking_123",
  schemaVersion: "1.0.0",
  // ... rest of fields
}
```

Handle migrations in application code:
```javascript
function migrateBooking(booking) {
  if (booking.schemaVersion === "1.0.0") {
    // Add new fields with defaults
    booking.paymentStatus = booking.paymentStatus || 'PENDING';
    booking.schemaVersion = "1.1.0";
  }
  return booking;
}
```

---

## Related Documentation
- [Architecture](./architecture.md)
- [API Reference](./api_reference.md)
- [AWS Deployment](./aws_deployment_plan.md)
