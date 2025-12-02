import { IsNumber, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsOptional()
  @IsUUID()
  rideId?: string;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sourceId?: string; // For Square: nonce or card token

  @IsOptional()
  @IsString()
  last4?: string;

  @IsOptional()
  @IsString()
  cardBrand?: string;
}
