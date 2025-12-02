import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentCompany } from '../../common/decorators/current-user.decorator';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Public()
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @Get('me')
  findMine(@CurrentCompany() companyId: string) {
    return this.companyService.findOne(companyId);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Get(':id/settings')
  getSettings(@Param('id') id: string) {
    return this.companyService.getSettings(id);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Patch(':id/settings')
  updateSettings(@Param('id') id: string, @Body() settings: any) {
    return this.companyService.updateSettings(id, settings);
  }
}
