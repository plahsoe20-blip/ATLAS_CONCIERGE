import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { CurrentCompany } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Roles(UserRole.COMPANY_ADMIN, UserRole.DISPATCHER)
  @Post()
  create(@CurrentCompany() companyId: string, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(companyId, createPaymentDto);
  }

  @Get()
  findAll(@CurrentCompany() companyId: string, @Query('rideId') rideId?: string) {
    return this.paymentService.findAll(companyId, rideId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.paymentService.findOne(id, companyId);
  }

  @Roles(UserRole.COMPANY_ADMIN, UserRole.DISPATCHER)
  @Patch(':id/capture')
  capture(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.paymentService.capture(id, companyId);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Patch(':id/refund')
  refund(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() refundDto: RefundPaymentDto,
  ) {
    return this.paymentService.refund(id, companyId, refundDto);
  }
}
