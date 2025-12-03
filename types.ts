
export enum UserRole {
  CONCIERGE = 'CONCIERGE',
  CLIENT = 'CLIENT',
  DRIVER = 'DRIVER',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN'
}

export enum BookingType {
  P2P = 'Point-to-Point',
  HOURLY = 'Hourly Charter',
  AIRPORT = 'Airport Transfer'
}

export enum VehicleCategory {
  SEDAN = 'Luxury Sedan',
  SUV = 'Luxury SUV',
  SPRINTER = 'Executive Sprinter',
  LIMO = 'First Class Limo'
}

// Full Booking Lifecycle State Machine
export enum BookingStatus {
  NEW = 'NEW',
  SOURCING = 'SOURCING',           // Broadcasting to operators
  QUOTING = 'QUOTING',             // Bids received
  OPERATOR_ASSIGNED = 'OPERATOR_ASSIGNED', // Operator selected
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',     // Specific driver/vehicle assigned
  DRIVER_EN_ROUTE = 'DRIVER_EN_ROUTE',
  ARRIVED = 'ARRIVED',
  PASSENGER_ONBOARD = 'PASSENGER_ONBOARD',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BILLING = 'BILLING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface PricingRule {
  vehicleCategory: VehicleCategory;
  hourlyRate: number;
  baseP2P: number;
  perKm: number;
  minHours: number;
  driverCommissionPct: number;
  taxRate: number;
}

export interface Quote {
  subtotal: number;
  tax: number;
  platformFee: number;
  total: number;
  breakdown: {
    baseFare: number;
    distanceFare?: number;
    timeFare?: number;
    extras?: number;
  };
  driverPayout: number;
  platformRevenue: number;
}

export interface VIPPreferences {
  preferredDriverGender?: 'Male' | 'Female' | 'Any';
  temperature?: 'Cool (68°F)' | 'Ambient (72°F)' | 'Warm (76°F)';
  music?: 'Silence' | 'Jazz' | 'Classical' | 'Pop' | 'Radio' | 'Client Aux';
  beverages?: string[]; // e.g., "Sparkling Water", "Coffee"
  meetAndGreet?: boolean;
  rampAccess?: boolean;
  quietRide?: boolean;
  specialInstructions?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  time: string;
  hours: number;
  pickupLocation: string;
  dropoffLocation?: string;
  notes?: string;
}

export interface QuoteRequest {
  id: string;
  conciergeId: string;
  status: BookingStatus; // Updated to use full lifecycle enum
  createdAt: number;
  details: {
    type: BookingType;
    pickupLocation: string;
    dropoffLocation?: string;
    date: string;
    time: string;
    durationHours?: number;
    durationDays?: number;
    vehicleCategory?: VehicleCategory; // Preferred category
    vehicleSubCategory?: string; // Specific Preference (e.g. Escalade)
    itinerary?: ItineraryDay[]; // For multi-day
    vipPreferences?: VIPPreferences; // Expanded VIP obj
    passengerCount: number;
    luggageCount: number;
  };
  estimatedPrice: number; // Baseline from pricing engine
  quoteCount?: number; // New field for UI
  selectedQuoteId?: string; // The accepted operator quote
  assignedDriverId?: string;
  assignedVehicleId?: string;
}

export interface OperatorQuote {
  id: string;
  requestId: string;
  operatorId: string;
  operatorName: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  vehicleCategory: VehicleCategory;
  price: number; // Total price
  eta: number; // Minutes
  rating: number; // 1-5
  notes?: string;
  isBestValue?: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export interface QuoteResponse {
  bookingId: string;
  operatorId: string;
  price: number;
  vehicleId: string;
  driverId: string;
  notes?: string;
  estimatedPickupTime: number;
  status: 'pending' | 'accepted' | 'declined';
  submittedAt: number;
}

export interface DriverLocation {
  lat: number;
  lng: number;
  heading: number; // 0-360
  speed: number; // km/h
  timestamp: number;
}

export interface ActiveTrip {
  id: string;
  bookingId: string;
  driverId: string;
  vehicleId: string;
  status: BookingStatus;
  currentLocation: DriverLocation;
  route: {
    pickup: { lat: number; lng: number; address: string };
    dropoff: { lat: number; lng: number; address: string };
    polyline: string[]; // Mocked as array of strings or coords
    totalDistance: number;
    totalDuration: number;
  };
  estimatedArrival: number; // Timestamp
  progress: number; // 0-100
}

export interface ConciergeStats {
  totalBookings: number;
  totalSpend: number;
  thisMonthSpend: number;
  activeTrips: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  companyId?: string;
  settings?: {
    notifications: boolean;
    darkMode: boolean;
  };
  conciergeStats?: ConciergeStats;
}

export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  licenseNumber: string;
  licenseExpiry: string;
  rating: number;
  totalTrips: number;
  documents: {
    license: boolean;
    backgroundCheck: boolean;
    insurance: boolean;
  };
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  amount: number;
  status: 'AUTHORIZED' | 'CAPTURED' | 'REFUNDED' | 'FAILED';
  method: 'CARD' | 'INVOICE' | 'WIRE';
  timestamp: number;
  squarePaymentId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  timestamp: number;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Vehicle {
  id: string;
  category: VehicleCategory;
  name: string;
  image: string;
  maxPassengers: number;
  maxLuggage: number;
  status?: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE';
}

export interface Driver {
  id: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  currentLocation?: string;
  vehicleId?: string;
  rating: number;
}

export interface BookingRequest {
  id?: string;
  type: BookingType;
  pickupLocation: string;
  dropoffLocation?: string;
  date: string;
  time: string;
  durationHours?: number;
  durationDays?: number;
  distanceKm?: number;
  vehicleId?: string;
  vehicleCategory?: VehicleCategory;
  passengerCount: number;
  passengerName?: string;
  passengerPhone?: string;
  passengerEmail?: string;
  luggageCount?: number;
  specialRequests?: string;
  estimatedPrice?: number;
  pickupTime?: number;
  quote?: Quote;
  quotes?: QuoteResponse[];
  preferences?: VIPPreferences;
  itinerary?: ItineraryDay[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingSources?: Array<{ uri: string; title: string }>;
}
