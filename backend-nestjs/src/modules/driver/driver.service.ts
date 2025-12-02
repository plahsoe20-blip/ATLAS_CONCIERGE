import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
import { DriverStatus } from '@prisma/client';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createDriverDto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: {
        ...createDriverDto,
        companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(companyId: string, status?: DriverStatus) {
    return this.prisma.driver.findMany({
      where: {
        companyId,
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        vehicles: {
          where: { isActive: true },
        },
        _count: {
          select: { rides: true },
        },
      },
    });
  }

  async findOne(id: string, companyId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        vehicles: true,
        rides: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async findByUserId(userId: string, companyId: string) {
    return this.prisma.driver.findFirst({
      where: { userId, companyId },
      include: {
        user: true,
        vehicles: true,
      },
    });
  }

  async update(id: string, companyId: string, updateDriverDto: UpdateDriverDto) {
    await this.findOne(id, companyId);

    return this.prisma.driver.update({
      where: { id },
      data: updateDriverDto,
    });
  }

  async updateStatus(id: string, companyId: string, status: DriverStatus) {
    return this.prisma.driver.update({
      where: { id },
      data: { status },
    });
  }

  async updateLocation(id: string, companyId: string, locationDto: UpdateDriverLocationDto) {
    await this.findOne(id, companyId);

    return this.prisma.driver.update({
      where: { id },
      data: {
        currentLat: locationDto.latitude,
        currentLng: locationDto.longitude,
        lastLocationUpdate: new Date(),
      },
    });
  }

  async getEarnings(id: string, companyId: string) {
    const driver = await this.findOne(id, companyId);

    const completedRides = await this.prisma.ride.findMany({
      where: {
        driverId: id,
        companyId,
        status: 'COMPLETED',
      },
      select: {
        totalFare: true,
        completedAt: true,
      },
    });

    const totalEarnings = completedRides.reduce((sum, ride) => sum + ride.totalFare, 0);

    return {
      driverId: id,
      totalEarnings,
      totalRides: completedRides.length,
      averagePerRide: completedRides.length > 0 ? totalEarnings / completedRides.length : 0,
      rides: completedRides,
    };
  }

  async getAvailableDrivers(companyId: string) {
    return this.prisma.driver.findMany({
      where: {
        companyId,
        status: DriverStatus.AVAILABLE,
        acceptsRides: true,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        vehicles: {
          where: { isActive: true },
        },
      },
    });
  }
}
