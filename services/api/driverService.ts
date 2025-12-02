import apiClient, { handleApiError } from './client';

export interface Driver {
  id: string;
  companyId: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseState: string;
  isVerified: boolean;
  status: 'OFFLINE' | 'AVAILABLE' | 'BUSY' | 'EN_ROUTE' | 'ON_BREAK';
  currentLat?: number;
  currentLng?: number;
  rating: number;
  totalRides: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

class DriverService {
  async getDrivers(status?: string): Promise<Driver[]> {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get<Driver[]>('/drivers', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    try {
      const response = await apiClient.get<Driver[]>('/drivers/available');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getDriverById(id: string): Promise<Driver> {
    try {
      const response = await apiClient.get<Driver>(`/drivers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateDriverStatus(id: string, status: string): Promise<Driver> {
    try {
      const response = await apiClient.patch<Driver>(`/drivers/${id}`, { status });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateDriverLocation(id: string, location: { lat: number; lng: number }): Promise<Driver> {
    try {
      const response = await apiClient.patch<Driver>(`/drivers/${id}/location`, {
        currentLat: location.lat,
        currentLng: location.lng,
        lastLocationUpdate: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyDriverProfile(): Promise<Driver> {
    try {
      const response = await apiClient.get<Driver>('/drivers/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const driverService = new DriverService();
export default driverService;
