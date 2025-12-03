import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { RideStatus } from '@prisma/client';
import { GoogleMapsService } from '../integrations/services/google-maps.service';

@Injectable()
export class RideService {
  constructor(
    private prisma: PrismaService,
    private googleMapsService: GoogleMapsService,
  ) { }

  async create(companyId: string, createRideDto: CreateRideDto) {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng, ...rideData } = createRideDto;

    // Calculate route and pricing
    const route = await this.googleMapsService.calculateRoute(
      { lat: pickupLat, lng: pickupLng },
      { lat: dropoffLat, lng: dropoffLng },
    );

    const distanceKm = route.distance / 1000;
    const durationMinutes = route.duration / 60;

    // Simple pricing calculation
    const baseFare = 5.0;
    const distanceFare = distanceKm * 2.5;
    const timeFare = durationMinutes * 0.5;
    const subtotal = baseFare + distanceFare + timeFare;
    const tax = subtotal * 0.08;
    const totalFare = subtotal + tax;

    const ride = await this.prisma.ride.create({
      data: {
        ...rideData,
        companyId,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        distanceKm,
        durationMinutes: Math.round(durationMinutes),
        baseFare,
        distanceFare,
        timeFare,
        tax,
        totalFare,
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        vehicle: true,
      },
    });

    // Create ride event
    await this.createRideEvent(ride.id, 'CREATED', 'Ride created');

    return ride;
  }

  async findAll(companyId: string, status?: RideStatus) {
    return this.prisma.ride.findMany({
      where: {
        companyId,
        ...(status && { status }),
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string, companyId: string) {
    const ride = await this.prisma.ride.findFirst({
      where: { id, companyId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        vehicle: true,
        events: {
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
      },
    });

    if (!ride) {
      throw new NotFoundException(`Ride with ID ${id} not found`);
    }

    return ride;
  }

  async update(id: string, companyId: string, updateRideDto: UpdateRideDto) {
    await this.findOne(id, companyId);

    return this.prisma.ride.update({
      where: { id },
      data: updateRideDto,
    });
  }

  async updateStatus(id: string, companyId: string, status: RideStatus, reason?: string) {
    const ride = await this.findOne(id, companyId);

    const updateData: any = { status };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.actualDropoffTime = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      if (reason) {
        updateData.cancellationReason = reason;
      }
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id },
      data: updateData,
    });

    // Create ride event
    await this.createRideEvent(id, 'STATUS_CHANGED', `Status changed to ${status}`);

    return updatedRide;
  }

  async assignDriver(id: string, companyId: string, driverId: string, vehicleId?: string) {
    const ride = await this.findOne(id, companyId);

    if (ride.status !== 'PENDING') {
      throw new BadRequestException('Can only assign driver to pending rides');
    }

    // Verify driver exists and is available
    const driver = await this.prisma.driver.findFirst({
      where: { id: driverId, companyId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id },
      data: {
        driverId,
        ...(vehicleId && { vehicleId }),
        status: 'CONFIRMED',
      },
      include: {
        driver: {
          include: {
            user: true,
          },
        },
        vehicle: true,
      },
    });

    // Create ride event
    await this.createRideEvent(id, 'ASSIGNED', `Driver ${driver.id} assigned`);

    return updatedRide;
  }

  async cancel(id: string, companyId: string, reason: string) {
    return this.updateStatus(id, companyId, 'CANCELLED', reason);
  }

  async getUpcoming(companyId: string, driverId?: string) {
    return this.prisma.ride.findMany({
      where: {
        companyId,
        ...(driverId && { driverId }),
        status: {
          in: ['PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'],
        },
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        vehicle: true,
      },
      orderBy: { pickupTime: 'asc' },
    });
  }

  private async createRideEvent(rideId: string, type: any, description: string) {
    return this.prisma.rideEvent.create({
      data: {
        rideId,
        type,
        description,
      },
    });
  }

  // ==================== OPERATOR QUOTE METHODS ====================

  async submitQuote(
    rideId: string,
    companyId: string,
    quoteData: {
      price: number;
      vehicleId: string;
      driverId: string;
      notes?: string;
      estimatedPickupTime: string;
    },
  ) {
    // Verify ride exists and is in PENDING status
    const ride = await this.prisma.ride.findFirst({
      where: { id: rideId, status: 'PENDING' },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found or not available for quotes');
    }

    // Create quote (in real implementation, use a Quote table)
    // For now, store in ride metadata or create ride events
    await this.prisma.rideEvent.create({
      data: {
        rideId,
        type: 'QUOTE_SUBMITTED',
        description: `Operator ${companyId} submitted quote: $${quoteData.price}`,
        metadata: JSON.stringify({
          operatorId: companyId,
          price: quoteData.price,
          vehicleId: quoteData.vehicleId,
          driverId: quoteData.driverId,
          notes: quoteData.notes,
          estimatedPickupTime: quoteData.estimatedPickupTime,
        }),
      },
    });

    return {
      message: 'Quote submitted successfully',
      rideId,
      price: quoteData.price,
    };
  }

  async getIncomingRequests(companyId: string) {
    // Return all PENDING rides that need quotes
    // In production, implement sophisticated matching based on:
    // - Operator service area
    // - Vehicle availability
    // - Past performance
    return this.prisma.ride.findMany({
      where: {
        status: 'PENDING',
        // Add logic to filter by geography, vehicle type, etc.
      },
      include: {
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async acceptQuote(quoteId: string, companyId: string) {
    // Parse quote from ride event
    const quoteEvent = await this.prisma.rideEvent.findUnique({
      where: { id: quoteId },
      include: { ride: true },
    });

    if (!quoteEvent || quoteEvent.type !== 'QUOTE_SUBMITTED') {
      throw new NotFoundException('Quote not found');
    }

    const metadata = JSON.parse(quoteEvent.metadata as string);

    // Assign ride to operator
    await this.prisma.ride.update({
      where: { id: quoteEvent.rideId },
      data: {
        companyId: metadata.operatorId,
        driverId: metadata.driverId,
        vehicleId: metadata.vehicleId,
        status: 'CONFIRMED',
        totalFare: metadata.price,
      },
    });

    await this.createRideEvent(
      quoteEvent.rideId,
      'QUOTE_ACCEPTED',
      `Quote from operator ${metadata.operatorId} accepted`,
    );

    return {
      message: 'Quote accepted successfully',
      rideId: quoteEvent.rideId,
    };
  }

  async declineQuote(quoteId: string, companyId: string, reason?: string) {
    const quoteEvent = await this.prisma.rideEvent.findUnique({
      where: { id: quoteId },
    });

    if (!quoteEvent) {
      throw new NotFoundException('Quote not found');
    }

    await this.createRideEvent(
      quoteEvent.rideId,
      'QUOTE_DECLINED',
      `Quote declined${reason ? ': ' + reason : ''}`,
    );

    return {
      message: 'Quote declined',
      rideId: quoteEvent.rideId,
    };
  }

  // ==================== DRIVER RIDE STATUS & LOCATION ====================

  async updateDriverRideStatus(rideId: string, userId: string, status: RideStatus) {
    // Get driver from user
    const driver = await this.prisma.driver.findFirst({
      where: { userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Verify driver is assigned to this ride
    const ride = await this.prisma.ride.findFirst({
      where: { id: rideId, driverId: driver.id },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found or not assigned to this driver');
    }

    // Update ride status
    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: { status },
    });

    // Create event
    const statusDescriptions: Record<string, string> = {
      EN_ROUTE: 'Driver en route to pickup',
      IN_PROGRESS: 'Passenger on board',
      COMPLETED: 'Trip completed',
    };

    await this.createRideEvent(
      rideId,
      'STATUS_CHANGED',
      statusDescriptions[status] || `Status changed to ${status}`,
    );

    return updatedRide;
  }

  async updateRideLocation(
    rideId: string,
    userId: string,
    location: { latitude: number; longitude: number; speed?: number; heading?: number },
  ) {
    const driver = await this.prisma.driver.findFirst({
      where: { userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Update driver location
    await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        currentLat: location.latitude,
        currentLng: location.longitude,
        lastLocationUpdate: new Date(),
      },
    });

    // Create location event for ride
    await this.prisma.rideEvent.create({
      data: {
        rideId,
        type: 'LOCATION_UPDATED',
        description: `Driver location updated`,
        latitude: location.latitude,
        longitude: location.longitude,
        metadata: JSON.stringify({
          speed: location.speed || 0,
          heading: location.heading || 0,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return { message: 'Location updated successfully' };
  }

  async getActiveRideForDriver(userId: string, companyId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { userId, companyId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return this.prisma.ride.findFirst({
      where: {
        driverId: driver.id,
        status: {
          in: ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'],
        },
      },
      include: {
        vehicle: true,
      },
    });
  }
}
