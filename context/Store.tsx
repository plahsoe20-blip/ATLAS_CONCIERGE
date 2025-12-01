import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  PricingRule, VehicleCategory, QuoteRequest, OperatorQuote, 
  BookingStatus, BookingType, ActiveTrip, UserRole, UserProfile, 
  DriverProfile, Notification, PaymentTransaction, VIPPreferences, ItineraryDay 
} from '../types';
import { mockLogin } from '../services/authService';
import { squarePreAuthorize, squareCapture } from '../services/paymentService';

// --- INITIAL DATA CONSTANTS ---
const INITIAL_PRICING_RULES: Record<VehicleCategory, PricingRule> = {
  [VehicleCategory.SEDAN]: { vehicleCategory: VehicleCategory.SEDAN, hourlyRate: 95.00, baseP2P: 125.00, perKm: 2.35, minHours: 3, driverCommissionPct: 0.75, taxRate: 0.08875 },
  [VehicleCategory.SUV]: { vehicleCategory: VehicleCategory.SUV, hourlyRate: 125.00, baseP2P: 160.00, perKm: 2.95, minHours: 3, driverCommissionPct: 0.75, taxRate: 0.08875 },
  [VehicleCategory.SPRINTER]: { vehicleCategory: VehicleCategory.SPRINTER, hourlyRate: 175.00, baseP2P: 250.00, perKm: 3.40, minHours: 4, driverCommissionPct: 0.70, taxRate: 0.08875 },
  [VehicleCategory.LIMO]: { vehicleCategory: VehicleCategory.LIMO, hourlyRate: 225.00, baseP2P: 350.00, perKm: 4.00, minHours: 4, driverCommissionPct: 0.80, taxRate: 0.08875 },
};

// Mock Route: Manhattan to JFK
const MOCK_ROUTE_COORDS = [
  { lat: 40.7580, lng: -73.9855 }, { lat: 40.7549, lng: -73.9840 }, { lat: 40.7484, lng: -73.9857 },
  { lat: 40.7420, lng: -73.9750 }, { lat: 40.7350, lng: -73.9700 }, { lat: 40.7300, lng: -73.9600 },
  { lat: 40.7200, lng: -73.9500 }, { lat: 40.7100, lng: -73.9400 }, { lat: 40.6900, lng: -73.9200 },
  { lat: 40.6600, lng: -73.8500 }, { lat: 40.6413, lng: -73.7781 }
];

interface StoreContextType {
  // Auth
  currentUser: UserProfile;
  isAuthenticated: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // Core Business Logic
  pricingRules: Record<VehicleCategory, PricingRule>;
  activeRequests: QuoteRequest[];
  marketplaceQuotes: OperatorQuote[];
  activeTrip: ActiveTrip | null;
  drivers: DriverProfile[];
  notifications: Notification[];
  
  // Booking Lifecycle Actions
  createBookingRequest: (details: any) => Promise<string>;
  submitOperatorQuote: (quote: Omit<OperatorQuote, 'id' | 'status'>) => Promise<void>;
  acceptQuote: (quoteId: string) => Promise<void>;
  assignDriver: (bookingId: string, driverId: string) => Promise<void>;
  driverAction: (action: 'ACCEPT' | 'START' | 'ARRIVE' | 'PICKUP' | 'COMPLETE') => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<void>;
  
  // Tools
  processPayment: (amount: number, method: 'CARD' | 'WIRE') => Promise<string>; // Returns Transaction ID
  triggerNotification: (type: Notification['type'], title: string, message: string) => void;
  dismissNotification: (id: string) => void;
  
  // Operator Tools
  addDriver: (driver: Omit<DriverProfile, 'id'>) => Promise<void>;
  updatePricingRule: (category: VehicleCategory, rule: Partial<PricingRule>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- GLOBAL STATE ---
  const [currentUser, setCurrentUser] = useState<UserProfile>({} as UserProfile);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [pricingRules, setPricingRules] = useState(INITIAL_PRICING_RULES);
  const [activeRequests, setActiveRequests] = useState<QuoteRequest[]>([]);
  const [marketplaceQuotes, setMarketplaceQuotes] = useState<OperatorQuote[]>([]);
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [drivers, setDrivers] = useState<DriverProfile[]>([
    { id: 'd1', name: 'James Doe', email: 'james@atlas.com', phone: '+15550101', avatar: '', status: 'ONLINE', licenseNumber: 'NY-88210', licenseExpiry: '2025-01-01', rating: 4.9, totalTrips: 142, documents: { license: true, backgroundCheck: true, insurance: true } }
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Simulation Refs
  const simulationInterval = useRef<any>(null);

  // --- AUTH ACTIONS ---
  const login = async (role: UserRole) => {
    try {
      const { user, token } = await mockLogin(role);
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('atlas_token', token); // Persist session
      triggerNotification('SUCCESS', `Welcome Back, ${user.name}`, `Logged in as ${role}`);
    } catch (e) {
      triggerNotification('ERROR', 'Login Failed', 'Invalid credentials');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser({} as UserProfile);
    localStorage.removeItem('atlas_token');
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
    triggerNotification('SUCCESS', 'Profile Updated', 'Changes saved successfully.');
  };

  // --- NOTIFICATIONS ---
  const triggerNotification = (type: Notification['type'], title: string, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message, timestamp: Date.now(), read: false }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 6000); // Auto dismiss
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- BOOKING LIFECYCLE ENGINE ---
  
  const createBookingRequest = async (details: any): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Latency
    const newId = `REQ-${Math.floor(Math.random() * 10000)}`;
    
    const newRequest: QuoteRequest = {
      id: newId,
      conciergeId: currentUser.id,
      status: BookingStatus.SOURCING,
      createdAt: Date.now(),
      details: details,
      estimatedPrice: details.estimatedPrice || 0
    };

    setActiveRequests(prev => [newRequest, ...prev]);
    triggerNotification('INFO', 'Sourcing Operators', 'Request broadcasted to network.');
    
    // Simulate incoming quotes from other operators
    setTimeout(() => {
      const botQuote: OperatorQuote = {
        id: `Q-BOT-${Date.now()}`,
        requestId: newId,
        operatorId: 'op_bot_1',
        operatorName: 'Prestige Worldwide',
        vehicleId: 'v_bot',
        vehicleName: 'Cadillac Escalade',
        vehicleImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
        vehicleCategory: details.vehicleCategory,
        price: details.estimatedPrice * 1.1,
        eta: 15,
        rating: 4.8,
        status: 'PENDING'
      };
      setMarketplaceQuotes(prev => [...prev, botQuote]);
      setActiveRequests(prev => prev.map(r => r.id === newId ? { ...r, status: BookingStatus.QUOTING, quoteCount: 1 } : r));
      triggerNotification('SUCCESS', 'New Quote Received', 'Prestige Worldwide sent a bid.');
    }, 3000);

    return newId;
  };

  const submitOperatorQuote = async (quoteData: Omit<OperatorQuote, 'id' | 'status'>) => {
    const newQuote: OperatorQuote = { ...quoteData, id: `Q-${Date.now()}`, status: 'PENDING' };
    setMarketplaceQuotes(prev => [...prev, newQuote]);
    setActiveRequests(prev => prev.map(r => 
      r.id === quoteData.requestId ? { ...r, status: BookingStatus.QUOTING, quoteCount: (r.quoteCount || 0) + 1 } : r
    ));
    triggerNotification('SUCCESS', 'Quote Submitted', 'Your bid is live in the marketplace.');
  };

  const acceptQuote = async (quoteId: string) => {
    const quote = marketplaceQuotes.find(q => q.id === quoteId);
    if (!quote) return;

    // Update Request Status
    setActiveRequests(prev => prev.map(r => 
      r.id === quote.requestId 
        ? { ...r, status: BookingStatus.OPERATOR_ASSIGNED, selectedQuoteId: quoteId, estimatedPrice: quote.price } 
        : r
    ));

    // Update Quote Status
    setMarketplaceQuotes(prev => prev.map(q => 
      q.id === quoteId ? { ...q, status: 'ACCEPTED' } : q.requestId === quote.requestId ? { ...q, status: 'DECLINED' } : q
    ));

    triggerNotification('SUCCESS', 'Quote Accepted', `Operator ${quote.operatorName} has been assigned.`);
  };

  const assignDriver = async (bookingId: string, driverId: string) => {
    setActiveRequests(prev => prev.map(r => 
      r.id === bookingId ? { ...r, status: BookingStatus.DRIVER_ASSIGNED, assignedDriverId: driverId } : r
    ));
    
    // Initialize Active Trip
    const request = activeRequests.find(r => r.id === bookingId);
    if (request) {
      const newTrip: ActiveTrip = {
        id: `TRIP-${Date.now()}`,
        bookingId: request.id,
        driverId: driverId,
        vehicleId: 'v1', // Mock
        status: BookingStatus.DRIVER_ASSIGNED,
        currentLocation: { lat: 40.7580, lng: -73.9855, heading: 0, speed: 0, timestamp: Date.now() },
        route: {
          pickup: { lat: 40.7580, lng: -73.9855, address: request.details.pickupLocation },
          dropoff: { lat: 40.6413, lng: -73.7781, address: request.details.dropoffLocation || '' },
          polyline: [], totalDistance: 25, totalDuration: 45
        },
        estimatedArrival: Date.now() + 15 * 60000,
        progress: 0
      };
      setActiveTrip(newTrip);
    }
    triggerNotification('INFO', 'Driver Assigned', 'Trip pushed to driver device.');
  };

  // --- DRIVER APP ACTIONS ---
  const driverAction = async (action: 'ACCEPT' | 'START' | 'ARRIVE' | 'PICKUP' | 'COMPLETE') => {
    if (!activeTrip) return;

    let newStatus = activeTrip.status;
    let notifTitle = '';
    let notifMsg = '';

    switch (action) {
      case 'ACCEPT':
        newStatus = BookingStatus.DRIVER_EN_ROUTE;
        notifTitle = 'Driver En Route';
        notifMsg = 'Vehicle is on the way to pickup.';
        startGPSSimulation(); // Start tracking
        break;
      case 'ARRIVE':
        newStatus = BookingStatus.ARRIVED;
        notifTitle = 'Driver Arrived';
        notifMsg = 'Vehicle is at pickup location.';
        break;
      case 'PICKUP':
        newStatus = BookingStatus.IN_PROGRESS;
        notifTitle = 'Trip Started';
        notifMsg = 'Passenger is on board.';
        break;
      case 'COMPLETE':
        newStatus = BookingStatus.COMPLETED;
        notifTitle = 'Trip Completed';
        notifMsg = 'Passenger dropped off.';
        stopGPSSimulation();
        // Auto Capture Payment
        const req = activeRequests.find(r => r.id === activeTrip.bookingId);
        if (req) await squareCapture(`tx_${req.id}`, req.estimatedPrice);
        break;
    }

    // Update Global State
    setActiveTrip(prev => prev ? { ...prev, status: newStatus } : null);
    setActiveRequests(prev => prev.map(r => r.id === activeTrip.bookingId ? { ...r, status: newStatus } : r));
    triggerNotification(action === 'COMPLETE' ? 'SUCCESS' : 'INFO', notifTitle, notifMsg);
  };

  // --- REAL-TIME GPS SIMULATOR ---
  const startGPSSimulation = () => {
    if (simulationInterval.current) clearInterval(simulationInterval.current);
    
    let step = 0;
    const TOTAL_STEPS = 200;

    simulationInterval.current = setInterval(() => {
      setActiveTrip(prev => {
        if (!prev || prev.status === BookingStatus.COMPLETED) return prev;
        
        step++;
        const progress = (step / TOTAL_STEPS) * 100;
        
        // Simple Interpolation Logic
        const routeIndex = Math.floor((progress / 100) * (MOCK_ROUTE_COORDS.length - 1));
        const p1 = MOCK_ROUTE_COORDS[routeIndex];
        const p2 = MOCK_ROUTE_COORDS[routeIndex + 1] || p1;
        const segmentProgress = ((progress / 100) * (MOCK_ROUTE_COORDS.length - 1)) % 1;
        
        const lat = p1.lat + (p2.lat - p1.lat) * segmentProgress;
        const lng = p1.lng + (p2.lng - p1.lng) * segmentProgress;

        return {
          ...prev,
          currentLocation: { lat, lng, heading: 0, speed: 45 + Math.random() * 10, timestamp: Date.now() },
          progress: progress
        };
      });
    }, 1000);
  };

  const stopGPSSimulation = () => {
    if (simulationInterval.current) clearInterval(simulationInterval.current);
  };

  // --- UTILS ---
  const processPayment = async (amount: number, method: 'CARD' | 'WIRE'): Promise<string> => {
    try {
      const tx = await squarePreAuthorize(amount, 'fake_nonce');
      triggerNotification('SUCCESS', 'Payment Authorized', `ID: ${tx.id}`);
      return tx.id;
    } catch (e) {
      triggerNotification('ERROR', 'Payment Failed', 'Card declined.');
      throw e;
    }
  };

  const cancelBooking = async (bookingId: string, reason: string) => {
    setActiveRequests(prev => prev.map(r => r.id === bookingId ? { ...r, status: BookingStatus.CANCELLED } : r));
    setActiveTrip(null);
    stopGPSSimulation();
    triggerNotification('WARNING', 'Booking Cancelled', reason);
  };

  const addDriver = async (driver: Omit<DriverProfile, 'id'>) => {
    setDrivers(prev => [...prev, { ...driver, id: `d_${Date.now()}` }]);
    triggerNotification('SUCCESS', 'Driver Added', `${driver.name} is now in the roster.`);
  };

  const updatePricingRule = (category: VehicleCategory, rule: Partial<PricingRule>) => {
    setPricingRules(prev => ({ ...prev, [category]: { ...prev[category], ...rule } }));
  };

  return (
    <StoreContext.Provider value={{
      currentUser, isAuthenticated, login, logout, updateUserProfile,
      pricingRules, activeRequests, marketplaceQuotes, activeTrip, drivers, notifications,
      createBookingRequest, submitOperatorQuote, acceptQuote, assignDriver, driverAction, cancelBooking,
      processPayment, triggerNotification, dismissNotification, addDriver, updatePricingRule
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a GlobalProvider');
  return context;
};
