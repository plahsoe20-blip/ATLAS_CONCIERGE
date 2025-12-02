import apiClient, { handleApiError } from './client';

export interface Ride {
  id: string;
  companyId: string;
  driverId?: string;
  vehicleId?: string;
  rideType: 'IMMEDIATE' | 'SCHEDULED' | 'RECURRING';
  status: 'PENDING' | 'CONFIRMED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupTime: string;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  estimatedDropoffTime?: string;
  distanceKm?: number;
  durationMinutes?: number;
  totalFare: number;
  specialRequests?: string;
  createdAt: string;
  driver?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
  vehicle?: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  };
}

export interface CreateRideDto {
  rideType: 'IMMEDIATE' | 'SCHEDULED' | 'RECURRING';
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupTime: string;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  specialRequests?: string;
  baseFare: number;
  totalFare: number;
}

class RideService {
  async createRide(data: CreateRideDto): Promise<Ride> {
    try {
      const response = await apiClient.post<Ride>('/rides', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getRides(status?: string): Promise<Ride[]> {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get<Ride[]>('/rides', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getRideById(id: string): Promise<Ride> {
    try {
      const response = await apiClient.get<Ride>(`/rides/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateRideStatus(id: string, status: string): Promise<Ride> {
    try {
      const response = await apiClient.patch<Ride>(`/rides/${id}`, { status });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async assignDriver(id: string, driverId: string, vehicleId: string): Promise<Ride> {
    try {
      const response = await apiClient.patch<Ride>(`/rides/${id}/assign`, { driverId, vehicleId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async cancelRide(id: string, reason: string): Promise<Ride> {
    try {
      const response = await apiClient.patch<Ride>(`/rides/${id}/cancel`, { cancellationReason: reason });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async completeRide(id: string): Promise<Ride> {
    try {
      const response = await apiClient.patch<Ride>(`/rides/${id}/complete`, {});
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const rideService = new RideService();
export default rideService;
