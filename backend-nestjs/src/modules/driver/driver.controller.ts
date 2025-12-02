import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
import { CurrentCompany, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, DriverStatus } from '@prisma/client';

@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Roles(UserRole.COMPANY_ADMIN, UserRole.DISPATCHER)
  @Post()
  create(@CurrentCompany() companyId: string, @Body() createDriverDto: CreateDriverDto) {
    return this.driverService.create(companyId, createDriverDto);
  }

  @Get()
  findAll(@CurrentCompany() companyId: string, @Query('status') status?: DriverStatus) {
    return this.driverService.findAll(companyId, status);
  }

  @Get('available')
  getAvailable(@CurrentCompany() companyId: string) {
    return this.driverService.getAvailableDrivers(companyId);
  }

  @Get('me')
  @Roles(UserRole.DRIVER)
  findMine(@CurrentUser('id') userId: string, @CurrentCompany() companyId: string) {
    return this.driverService.findByUserId(userId, companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.driverService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return this.driverService.update(id, companyId, updateDriverDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body('status') status: DriverStatus,
  ) {
    return this.driverService.updateStatus(id, companyId, status);
  }

  @Patch(':id/location')
  updateLocation(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() locationDto: UpdateDriverLocationDto,
  ) {
    return this.driverService.updateLocation(id, companyId, locationDto);
  }

  @Get(':id/earnings')
  getEarnings(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.driverService.getEarnings(id, companyId);
  }
}
