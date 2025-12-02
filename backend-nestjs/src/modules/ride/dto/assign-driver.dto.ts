import { IsUUID, IsOptional } from 'class-validator';

export class AssignDriverDto {
  @IsUUID()
  driverId: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;
}
