import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, TravelMode, UnitSystem } from '@googlemaps/google-maps-services-js';

interface Location {
  lat: number;
  lng: number;
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private client: Client;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('GOOGLE_MAPS_API_KEY') || '';
    this.client = new Client({});
  }

  async calculateRoute(origin: Location, destination: Location) {
    try {
      const response = await this.client.directions({
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode: TravelMode.driving,
          key: this.apiKey,
        },
      });

      if (response.data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.value, // in meters
        duration: leg.duration.value, // in seconds
        polyline: route.overview_polyline.points,
        steps: leg.steps.map((step) => ({
          instruction: step.html_instructions,
          distance: step.distance.value,
          duration: step.duration.value,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to calculate route: ${error.message}`);
      throw error;
    }
  }

  async getDistanceMatrix(origins: Location[], destinations: Location[]) {
    try {
      const response = await this.client.distancematrix({
        params: {
          origins: origins.map((loc) => `${loc.lat},${loc.lng}`),
          destinations: destinations.map((loc) => `${loc.lat},${loc.lng}`),
          mode: TravelMode.driving,
          units: UnitSystem.metric,
          key: this.apiKey,
        },
      });

      return response.data.rows.map((row, i) => ({
        origin: origins[i],
        elements: row.elements.map((element, j) => ({
          destination: destinations[j],
          distance: element.distance?.value || 0,
          duration: element.duration?.value || 0,
          status: element.status,
        })),
      }));
    } catch (error) {
      this.logger.error(`Failed to get distance matrix: ${error.message}`);
      throw error;
    }
  }

  async geocode(address: string) {
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      });

      if (response.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const result = response.data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };
    } catch (error) {
      this.logger.error(`Failed to geocode address: ${error.message}`);
      throw error;
    }
  }

  async reverseGeocode(location: Location) {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: `${location.lat},${location.lng}`,
          key: this.apiKey,
        },
      });

      if (response.data.results.length === 0) {
        throw new Error('Location not found');
      }

      return response.data.results[0].formatted_address;
    } catch (error) {
      this.logger.error(`Failed to reverse geocode: ${error.message}`);
      throw error;
    }
  }

  async searchPlaces(query: string, location?: Location) {
    try {
      const params: any = {
        query,
        key: this.apiKey,
      };

      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = 50000; // 50km radius
      }

      const response = await this.client.textSearch({ params });

      return response.data.results.map((place) => ({
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry?.location.lat || 0,
        lng: place.geometry?.location.lng || 0,
        placeId: place.place_id,
        rating: place.rating,
        types: place.types,
      }));
    } catch (error) {
      this.logger.error(`Failed to search places: ${error.message}`);
      throw error;
    }
  }
}
