import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with DynamoDB in production)
const users = new Map();
const bookings = new Map();
const drivers = new Map();
const vehicles = new Map();
const operators = new Map();
const quotes = new Map();
const transactions = new Map();

// User Model
export class User {
  constructor(data) {
    this.id = data.id || `user_${uuidv4()}`;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.passwordHash = data.passwordHash;
    this.role = data.role; // CONCIERGE, DRIVER, OPERATOR, ADMIN
    this.avatar = data.avatar || '';
    this.settings = data.settings || { notifications: true, darkMode: true };
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
    this.lastLogin = data.lastLogin || null;
    this.status = data.status || 'ACTIVE'; // ACTIVE, SUSPENDED, DELETED
  }

  static async create(data) {
    const user = new User(data);
    users.set(user.id, user);
    return user;
  }

  static async findById(id) {
    return users.get(id) || null;
  }

  static async findByEmail(email) {
    return Array.from(users.values()).find(u => u.email === email) || null;
  }

  static async update(id, data) {
    const user = users.get(id);
    if (!user) return null;
    Object.assign(user, data, { updatedAt: Date.now() });
    users.set(id, user);
    return user;
  }

  static async delete(id) {
    return users.delete(id);
  }

  static async findAll(filters = {}) {
    let results = Array.from(users.values());
    if (filters.role) results = results.filter(u => u.role === filters.role);
    if (filters.status) results = results.filter(u => u.status === filters.status);
    return results;
  }

  toJSON() {
    const { passwordHash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

// Booking Model
export class Booking {
  constructor(data) {
    this.id = data.id || `booking_${uuidv4()}`;
    this.conciergeId = data.conciergeId;
    this.operatorId = data.operatorId || null;
    this.driverId = data.driverId || null;
    this.vehicleId = data.vehicleId || null;
    this.status = data.status || 'NEW'; // NEW, SOURCING, QUOTING, OPERATOR_ASSIGNED, etc.
    this.type = data.type; // P2P, HOURLY, AIRPORT
    this.details = data.details; // Pickup, dropoff, date, time, preferences, etc.
    this.estimatedPrice = data.estimatedPrice || 0;
    this.finalPrice = data.finalPrice || null;
    this.selectedQuoteId = data.selectedQuoteId || null;
    this.paymentStatus = data.paymentStatus || 'PENDING'; // PENDING, AUTHORIZED, CAPTURED, REFUNDED
    this.transactionId = data.transactionId || null;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
    this.completedAt = data.completedAt || null;
    this.cancelledAt = data.cancelledAt || null;
    this.cancellationReason = data.cancellationReason || null;
  }

  static async create(data) {
    const booking = new Booking(data);
    bookings.set(booking.id, booking);
    return booking;
  }

  static async findById(id) {
    return bookings.get(id) || null;
  }

  static async update(id, data) {
    const booking = bookings.get(id);
    if (!booking) return null;
    Object.assign(booking, data, { updatedAt: Date.now() });
    bookings.set(id, booking);
    return booking;
  }

  static async findAll(filters = {}) {
    let results = Array.from(bookings.values());
    if (filters.conciergeId) results = results.filter(b => b.conciergeId === filters.conciergeId);
    if (filters.operatorId) results = results.filter(b => b.operatorId === filters.operatorId);
    if (filters.driverId) results = results.filter(b => b.driverId === filters.driverId);
    if (filters.status) results = results.filter(b => b.status === filters.status);
    return results;
  }
}

// Driver Model
export class Driver {
  constructor(data) {
    this.id = data.id || `driver_${uuidv4()}`;
    this.userId = data.userId; // Link to User
    this.operatorId = data.operatorId;
    this.status = data.status || 'OFFLINE'; // ONLINE, OFFLINE, BUSY
    this.licenseNumber = data.licenseNumber;
    this.licenseExpiry = data.licenseExpiry;
    this.rating = data.rating || 5.0;
    this.totalTrips = data.totalTrips || 0;
    this.documents = data.documents || { license: false, backgroundCheck: false, insurance: false };
    this.currentLocation = data.currentLocation || null;
    this.currentBookingId = data.currentBookingId || null;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  static async create(data) {
    const driver = new Driver(data);
    drivers.set(driver.id, driver);
    return driver;
  }

  static async findById(id) {
    return drivers.get(id) || null;
  }

  static async findByUserId(userId) {
    return Array.from(drivers.values()).find(d => d.userId === userId) || null;
  }

  static async update(id, data) {
    const driver = drivers.get(id);
    if (!driver) return null;
    Object.assign(driver, data, { updatedAt: Date.now() });
    drivers.set(id, driver);
    return driver;
  }

  static async findAll(filters = {}) {
    let results = Array.from(drivers.values());
    if (filters.operatorId) results = results.filter(d => d.operatorId === filters.operatorId);
    if (filters.status) results = results.filter(d => d.status === filters.status);
    return results;
  }
}

// Vehicle Model
export class Vehicle {
  constructor(data) {
    this.id = data.id || `vehicle_${uuidv4()}`;
    this.operatorId = data.operatorId;
    this.category = data.category; // SEDAN, SUV, SPRINTER, LIMO
    this.name = data.name;
    this.image = data.image || '';
    this.plateNumber = data.plateNumber;
    this.maxPassengers = data.maxPassengers;
    this.maxLuggage = data.maxLuggage;
    this.status = data.status || 'AVAILABLE'; // AVAILABLE, ON_TRIP, MAINTENANCE
    this.features = data.features || [];
    this.currentDriverId = data.currentDriverId || null;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  static async create(data) {
    const vehicle = new Vehicle(data);
    vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  static async findById(id) {
    return vehicles.get(id) || null;
  }

  static async update(id, data) {
    const vehicle = vehicles.get(id);
    if (!vehicle) return null;
    Object.assign(vehicle, data, { updatedAt: Date.now() });
    vehicles.set(id, vehicle);
    return vehicle;
  }

  static async findAll(filters = {}) {
    let results = Array.from(vehicles.values());
    if (filters.operatorId) results = results.filter(v => v.operatorId === filters.operatorId);
    if (filters.status) results = results.filter(v => v.status === filters.status);
    if (filters.category) results = results.filter(v => v.category === filters.category);
    return results;
  }
}

// Operator Model
export class Operator {
  constructor(data) {
    this.id = data.id || `operator_${uuidv4()}`;
    this.userId = data.userId; // Link to User
    this.companyName = data.companyName;
    this.businessLicense = data.businessLicense;
    this.rating = data.rating || 5.0;
    this.totalBookings = data.totalBookings || 0;
    this.activeDrivers = data.activeDrivers || 0;
    this.activeVehicles = data.activeVehicles || 0;
    this.pricingRules = data.pricingRules || {};
    this.status = data.status || 'ACTIVE'; // ACTIVE, SUSPENDED
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  static async create(data) {
    const operator = new Operator(data);
    operators.set(operator.id, operator);
    return operator;
  }

  static async findById(id) {
    return operators.get(id) || null;
  }

  static async findByUserId(userId) {
    return Array.from(operators.values()).find(o => o.userId === userId) || null;
  }

  static async update(id, data) {
    const operator = operators.get(id);
    if (!operator) return null;
    Object.assign(operator, data, { updatedAt: Date.now() });
    operators.set(id, operator);
    return operator;
  }

  static async findAll(filters = {}) {
    let results = Array.from(operators.values());
    if (filters.status) results = results.filter(o => o.status === filters.status);
    return results;
  }
}

// Quote Model
export class Quote {
  constructor(data) {
    this.id = data.id || `quote_${uuidv4()}`;
    this.bookingId = data.bookingId;
    this.operatorId = data.operatorId;
    this.vehicleId = data.vehicleId;
    this.price = data.price;
    this.eta = data.eta; // minutes
    this.notes = data.notes || '';
    this.status = data.status || 'PENDING'; // PENDING, ACCEPTED, DECLINED, EXPIRED
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
    this.expiresAt = data.expiresAt || Date.now() + (30 * 60 * 1000); // 30 min default
  }

  static async create(data) {
    const quote = new Quote(data);
    quotes.set(quote.id, quote);
    return quote;
  }

  static async findById(id) {
    return quotes.get(id) || null;
  }

  static async update(id, data) {
    const quote = quotes.get(id);
    if (!quote) return null;
    Object.assign(quote, data, { updatedAt: Date.now() });
    quotes.set(id, quote);
    return quote;
  }

  static async findAll(filters = {}) {
    let results = Array.from(quotes.values());
    if (filters.bookingId) results = results.filter(q => q.bookingId === filters.bookingId);
    if (filters.operatorId) results = results.filter(q => q.operatorId === filters.operatorId);
    if (filters.status) results = results.filter(q => q.status === filters.status);
    return results;
  }
}

// Transaction Model
export class Transaction {
  constructor(data) {
    this.id = data.id || `txn_${uuidv4()}`;
    this.bookingId = data.bookingId;
    this.amount = data.amount;
    this.status = data.status || 'PENDING'; // PENDING, AUTHORIZED, CAPTURED, REFUNDED, FAILED
    this.method = data.method || 'CARD'; // CARD, INVOICE, WIRE
    this.paymentGatewayId = data.paymentGatewayId || null; // Square Payment ID
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  static async create(data) {
    const transaction = new Transaction(data);
    transactions.set(transaction.id, transaction);
    return transaction;
  }

  static async findById(id) {
    return transactions.get(id) || null;
  }

  static async findByBookingId(bookingId) {
    return Array.from(transactions.values()).find(t => t.bookingId === bookingId) || null;
  }

  static async update(id, data) {
    const transaction = transactions.get(id);
    if (!transaction) return null;
    Object.assign(transaction, data, { updatedAt: Date.now() });
    transactions.set(id, transaction);
    return transaction;
  }
}

// Export storage for testing/debugging
export const storage = {
  users,
  bookings,
  drivers,
  vehicles,
  operators,
  quotes,
  transactions,
  clear: () => {
    users.clear();
    bookings.clear();
    drivers.clear();
    vehicles.clear();
    operators.clear();
    quotes.clear();
    transactions.clear();
  }
};
