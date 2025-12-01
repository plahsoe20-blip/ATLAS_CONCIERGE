import { Vehicle, VehicleCategory } from './types';

// Pricing Configuration
export const PRICING_RULES: Record<VehicleCategory, { hourly: number; baseP2P: number; perKm: number; minHours: number }> = {
  [VehicleCategory.SEDAN]: { hourly: 150, baseP2P: 50, perKm: 3.5, minHours: 3 },
  [VehicleCategory.SUV]: { hourly: 185, baseP2P: 75, perKm: 4.5, minHours: 3 },
  [VehicleCategory.SPRINTER]: { hourly: 225, baseP2P: 100, perKm: 5.5, minHours: 4 },
  [VehicleCategory.LIMO]: { hourly: 300, baseP2P: 150, perKm: 7.0, minHours: 4 },
};

export const VEHICLE_SUB_CATEGORIES: Record<VehicleCategory, string[]> = {
  [VehicleCategory.SEDAN]: [
    'Any Luxury Sedan',
    'Mercedes-Benz S-Class',
    'BMW 7 Series',
    'Audi A8',
    'Lexus LS'
  ],
  [VehicleCategory.SUV]: [
    'Any Luxury SUV',
    'Cadillac Escalade',
    'GMC Yukon Denali',
    'Lincoln Navigator',
    'Chevrolet Suburban High Country',
    'Range Rover'
  ],
  [VehicleCategory.SPRINTER]: [
    'Any Sprinter',
    'Executive (Jet Style)',
    'Passenger (Bench Rows)',
    'Limo Style (Wrap-around)'
  ],
  [VehicleCategory.LIMO]: [
    'Any Ultra-Luxury',
    'Rolls Royce Phantom',
    'Rolls Royce Ghost',
    'Bentley Mulsanne',
    'Mercedes-Maybach'
  ]
};

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    category: VehicleCategory.SEDAN,
    name: 'Mercedes-Benz S-Class',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
    maxPassengers: 3,
    maxLuggage: 2,
  },
  {
    id: 'v2',
    category: VehicleCategory.SUV,
    name: 'Cadillac Escalade ESV',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
    maxPassengers: 6,
    maxLuggage: 6,
  },
  {
    id: 'v3',
    category: VehicleCategory.SPRINTER,
    name: 'Mercedes-Benz Sprinter JetVan',
    image: 'https://images.unsplash.com/photo-1695758257008-8e64736f5686?auto=format&fit=crop&q=80&w=800',
    maxPassengers: 12,
    maxLuggage: 10,
  },
  {
    id: 'v4',
    category: VehicleCategory.LIMO,
    name: 'Rolls Royce Phantom',
    image: 'https://images.unsplash.com/photo-1631295868223-63265840d00f?auto=format&fit=crop&q=80&w=800',
    maxPassengers: 3,
    maxLuggage: 3,
  }
];

export const MOCK_BOOKINGS = [
  { id: 'BLK-9281', client: 'Alistair Pennyworth', type: 'Hourly', vehicle: 'Mercedes S-Class', date: 'Oct 24, 2023', status: 'Confirmed', price: 1250 },
  { id: 'BLK-1192', client: 'Sarah Connor', type: 'P2P', vehicle: 'Cadillac Escalade', date: 'Oct 25, 2023', status: 'Pending', price: 185 },
  { id: 'BLK-3321', client: 'James Bond', type: 'P2P', vehicle: 'Rolls Royce', date: 'Oct 26, 2023', status: 'Completed', price: 450 },
];

export const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"];