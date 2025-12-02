import { PartialType } from '@nestjs/mapped-types';
import { CreateRideDto } from './create-ride.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { RideStatus } from '@prisma/client';

export class UpdateRideDto extends PartialType(CreateRideDto) {
  @IsOptional()
  @IsEnum(RideStatus)
  status?: RideStatus;
}
