import { IsString, IsUUID, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateDriverDto {
  @IsUUID()
  userId: string;

  @IsString()
  licenseNumber: string;

  @IsDateString()
  licenseExpiry: string;

  @IsString()
  licenseState: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptsRides?: boolean;
}
