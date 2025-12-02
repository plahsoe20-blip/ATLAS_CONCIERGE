import { Controller, Get, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentCompany } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@CurrentCompany() companyId: string, @Query('role') role?: string) {
    if (role) {
      return this.userService.getUsersByRole(companyId, role);
    }
    return this.userService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.userService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, companyId, updateUserDto);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.userService.remove(id, companyId);
  }
}
