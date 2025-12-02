import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  PricingRule, VehicleCategory, QuoteRequest, OperatorQuote, 
  BookingStatus, BookingType, ActiveTrip, UserRole, UserProfile, 
  DriverProfile, Notification, PaymentTransaction, VIPPreferences, ItineraryDay 
} from '../types';
import { authService, rideService, driverService, webSocketService } from '../services/api';
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

  // Load initial data on mount
  useEffect(() => {
    const initializeData = async () => {
      // Check if user is already authenticated
      const token = authService.isAuthenticated();
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          const user: UserProfile = {
            id: userData.id,
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            phone: userData.phone || '',
            role: userData.role as UserRole,
            avatar: userData.avatar || '',
            companyId: userData.companyId
          };
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          // Connect WebSocket
          webSocketService.connect();

          // Load drivers if operator/concierge
          if (user.role === 'OPERATOR' || user.role === 'CONCIERGE') {
            const driversData = await driverService.getDrivers();
            const mappedDrivers: DriverProfile[] = driversData.map(d => ({
              id: d.id,
              name: `${d.user.firstName} ${d.user.lastName}`,
              email: d.user.email,
              phone: d.user.phone || '',
              avatar: '',
              status: d.status as any,
              licenseNumber: d.licenseNumber,
              licenseExpiry: d.licenseExpiry,
              rating: d.rating,
              totalTrips: d.totalRides,
              documents: {
                license: true,
                backgroundCheck: d.isVerified,
                insurance: true
              }
            }));
            setDrivers(mappedDrivers);
          }

          // Load active rides
          const rides = await rideService.getRides();
          const mappedRequests: QuoteRequest[] = rides
            .filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED')
            .map(r => ({
              id: r.id,
              conciergeId: user.id,
              status: r.status as BookingStatus,
              createdAt: new Date(r.createdAt).getTime(),
              details: {
                type: BookingType.P2P,
                pickupLocation: r.pickupAddress,
                dropoffLocation: r.dropoffAddress,
                date: new Date(r.pickupTime).toISOString().split('T')[0],
                time: new Date(r.pickupTime).toTimeString().split(' ')[0],
                vehicleCategory: VehicleCategory.SEDAN,
                passengerCount: 1,
                luggageCount: 0,
                specialRequests: r.specialRequests
              },
              estimatedPrice: r.totalFare
            }));
          setActiveRequests(mappedRequests);
        } catch (error) {
          console.error('Failed to initialize data:', error);
          authService.logout();
        }
      }
    };

    initializeData();

    // Setup WebSocket listeners
    webSocketService.onRideCreated((data) => {
      triggerNotification('INFO', 'New Ride Request', `From ${data.passengerName}`);
    });

    webSocketService.onRideStatusUpdated((data) => {
      setActiveRequests(prev => prev.map(r => 
        r.id === data.rideId ? { ...r, status: data.status } : r
      ));
    });

    webSocketService.onDriverLocationUpdated((data) => {
      if (activeTrip?.driverId === data.driverId) {
        setActiveTrip(prev => prev ? {
          ...prev,
          currentLocation: {
            lat: data.lat,
            lng: data.lng,
            heading: data.heading || 0,
            speed: data.speed || 0,
            timestamp: Date.now()
          }
        } : null);
      }
    });

    return () => {
      webSocketService.removeAllListeners();
    };
  }, []);

  // --- AUTH ACTIONS ---
  const login = async (role: UserRole) => {
    try {
      // For demo, use predefined test accounts
      const testAccounts = {
        CONCIERGE: { email: 'concierge@atlas.com', password: 'Password123!', companyId: 'company_1' },
        DRIVER: { email: 'driver@atlas.com', password: 'Password123!', companyId: 'company_1' },
        OPERATOR: { email: 'operator@atlas.com', password: 'Password123!', companyId: 'company_1' }
      };

      const credentials = testAccounts[role];
      const response = await authService.login(credentials);
      
      const user: UserProfile = {
        id: response.user.id,
        name: `${response.user.firstName} ${response.user.lastName}`,
        email: response.user.email,
        phone: '',
        role: response.user.role as UserRole,
        avatar: '',
        companyId: response.user.companyId
      };

      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Connect WebSocket
      webSocketService.connect();
      
      triggerNotification('SUCCESS', `Welcome Back, ${user.name}`, `Logged in as ${role}`);
    } catch (e: any) {
      console.error('Login error:', e);
      triggerNotification('ERROR', 'Login Failed', e.message || 'Invalid credentials');
    }
  };

  const logout = () => {
    authService.logout();
    webSocketService.disconnect();
    setIsAuthenticated(false);
    setCurrentUser({} as UserProfile);
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
    try {
      const rideData = {
        rideType: 'IMMEDIATE' as const,
        passengerName: details.passengerName,
        passengerPhone: details.passengerPhone,
        passengerEmail: details.passengerEmail,
        pickupAddress: details.pickupLocation,
        pickupLat: 40.7580, // TODO: Get from geocoding
        pickupLng: -73.9855,
        pickupTime: new Date(details.pickupTime).toISOString(),
        dropoffAddress: details.dropoffLocation,
        dropoffLat: 40.6413,
        dropoffLng: -73.7781,
        specialRequests: details.specialRequests,
        baseFare: details.estimatedPrice || 0,
        totalFare: details.estimatedPrice || 0
      };

      const ride = await rideService.createRide(rideData);
      
      const newRequest: QuoteRequest = {
        id: ride.id,
        conciergeId: currentUser.id,
        status: ride.status as BookingStatus,
        createdAt: new Date(ride.createdAt).getTime(),
        details: details,
        estimatedPrice: ride.totalFare
      };

      setActiveRequests(prev => [newRequest, ...prev]);
      triggerNotification('SUCCESS', 'Ride Created', 'Request sent to available drivers.');
      
      return ride.id;
    } catch (error: any) {
      triggerNotification('ERROR', 'Failed to Create Ride', error.message);
      throw error;
    }
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
    try {
      // Get first available vehicle for this driver (simplified)
      const ride = await rideService.assignDriver(bookingId, driverId, 'vehicle_1');
      
      setActiveRequests(prev => prev.map(r => 
        r.id === bookingId ? { ...r, status: ride.status as BookingStatus, assignedDriverId: driverId } : r
      ));
      
      // Initialize Active Trip
      const request = activeRequests.find(r => r.id === bookingId);
      if (request) {
        const newTrip: ActiveTrip = {
          id: ride.id,
          bookingId: request.id,
          driverId: driverId,
          vehicleId: ride.vehicleId || 'v1',
          status: ride.status as BookingStatus,
          currentLocation: { lat: ride.pickupLat, lng: ride.pickupLng, heading: 0, speed: 0, timestamp: Date.now() },
          route: {
            pickup: { lat: ride.pickupLat, lng: ride.pickupLng, address: ride.pickupAddress },
            dropoff: { lat: ride.dropoffLat, lng: ride.dropoffLng, address: ride.dropoffAddress },
            polyline: [], totalDistance: ride.distanceKm || 25, totalDuration: ride.durationMinutes || 45
          },
          estimatedArrival: Date.now() + 15 * 60000,
          progress: 0
        };
        setActiveTrip(newTrip);
      }
      triggerNotification('SUCCESS', 'Driver Assigned', 'Trip pushed to driver device.');
    } catch (error: any) {
      triggerNotification('ERROR', 'Assignment Failed', error.message);
      throw error;
    }
  };

  // --- DRIVER APP ACTIONS ---
  const driverAction = async (action: 'ACCEPT' | 'START' | 'ARRIVE' | 'PICKUP' | 'COMPLETE') => {
    if (!activeTrip) return;

    let newStatus = activeTrip.status;
    let apiStatus = '';
    let notifTitle = '';
    let notifMsg = '';

    switch (action) {
      case 'ACCEPT':
        newStatus = BookingStatus.DRIVER_EN_ROUTE;
        apiStatus = 'CONFIRMED';
        notifTitle = 'Driver En Route';
        notifMsg = 'Vehicle is on the way to pickup.';
        startGPSSimulation(); // Start tracking
        break;
      case 'ARRIVE':
        newStatus = BookingStatus.ARRIVED;
        apiStatus = 'EN_ROUTE';
        notifTitle = 'Driver Arrived';
        notifMsg = 'Vehicle is at pickup location.';
        break;
      case 'PICKUP':
        newStatus = BookingStatus.IN_PROGRESS;
        apiStatus = 'IN_PROGRESS';
        notifTitle = 'Trip Started';
        notifMsg = 'Passenger is on board.';
        break;
      case 'COMPLETE':
        newStatus = BookingStatus.COMPLETED;
        apiStatus = 'COMPLETED';
        notifTitle = 'Trip Completed';
        notifMsg = 'Passenger dropped off.';
        stopGPSSimulation();
        break;
    }

    try {
      // Update ride status via API
      await rideService.updateRideStatus(activeTrip.bookingId, apiStatus);

      // Update Global State
      setActiveTrip(prev => prev ? { ...prev, status: newStatus } : null);
      setActiveRequests(prev => prev.map(r => r.id === activeTrip.bookingId ? { ...r, status: newStatus } : r));
      triggerNotification(action === 'COMPLETE' ? 'SUCCESS' : 'INFO', notifTitle, notifMsg);

      // Auto Capture Payment on completion
      if (action === 'COMPLETE') {
        const req = activeRequests.find(r => r.id === activeTrip.bookingId);
        if (req) {
          try {
            await squareCapture(`tx_${req.id}`, req.estimatedPrice);
          } catch (e) {
            console.error('Payment capture failed:', e);
          }
        }
      }
    } catch (error: any) {
      triggerNotification('ERROR', 'Action Failed', error.message);
      throw error;
    }
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
    try {
      await rideService.cancelRide(bookingId, reason);
      setActiveRequests(prev => prev.map(r => r.id === bookingId ? { ...r, status: BookingStatus.CANCELLED } : r));
      setActiveTrip(null);
      stopGPSSimulation();
      triggerNotification('WARNING', 'Booking Cancelled', reason);
    } catch (error: any) {
      triggerNotification('ERROR', 'Cancellation Failed', error.message);
      throw error;
    }
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
