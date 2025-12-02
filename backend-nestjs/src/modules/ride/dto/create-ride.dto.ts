import {
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { RideType } from '@prisma/client';

export class CreateRideDto {
  @IsEnum(RideType)
  rideType: RideType;

  @IsString()
  passengerName: string;

  @IsString()
  passengerPhone: string;

  @IsOptional()
  @IsString()
  passengerEmail?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsString()
  pickupAddress: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  pickupLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  pickupLng: number;

  @IsDateString()
  pickupTime: string;

  @IsString()
  dropoffAddress: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  dropoffLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  dropoffLng: number;

  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
