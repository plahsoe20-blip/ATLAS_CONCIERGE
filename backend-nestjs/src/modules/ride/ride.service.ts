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
  ) {}

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
}
