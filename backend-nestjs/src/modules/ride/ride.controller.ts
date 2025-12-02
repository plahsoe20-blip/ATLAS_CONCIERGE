import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { RideService } from './ride.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { CurrentCompany } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, RideStatus } from '@prisma/client';

@Controller('rides')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  @Roles(UserRole.COMPANY_ADMIN, UserRole.DISPATCHER, UserRole.CONCIERGE)
  @Post()
  create(@CurrentCompany() companyId: string, @Body() createRideDto: CreateRideDto) {
    return this.rideService.create(companyId, createRideDto);
  }

  @Get()
  findAll(@CurrentCompany() companyId: string, @Query('status') status?: RideStatus) {
    return this.rideService.findAll(companyId, status);
  }

  @Get('upcoming')
  getUpcoming(@CurrentCompany() companyId: string, @Query('driverId') driverId?: string) {
    return this.rideService.getUpcoming(companyId, driverId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.rideService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() updateRideDto: UpdateRideDto,
  ) {
    return this.rideService.update(id, companyId, updateRideDto);
  }

  @Roles(UserRole.COMPANY_ADMIN, UserRole.DISPATCHER)
  @Patch(':id/assign')
  assignDriver(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() assignDriverDto: AssignDriverDto,
  ) {
    return this.rideService.assignDriver(
      id,
      companyId,
      assignDriverDto.driverId,
      assignDriverDto.vehicleId,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() body: { status: RideStatus; reason?: string },
  ) {
    return this.rideService.updateStatus(id, companyId, body.status, body.reason);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body('reason') reason: string,
  ) {
    return this.rideService.cancel(id, companyId, reason);
  }
}
