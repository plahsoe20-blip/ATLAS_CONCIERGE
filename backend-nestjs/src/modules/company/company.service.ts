import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) { }

  async create(createCompanyDto: CreateCompanyDto) {
    const { email } = createCompanyDto;

    const existing = await this.prisma.company.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Company with this email already exists');
    }

    return this.prisma.company.create({
      data: createCompanyDto,
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            users: true,
            drivers: true,
            vehicles: true,
            rides: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            drivers: true,
            vehicles: true,
            rides: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(id);

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getSettings(companyId: string) {
    const company = await this.findOne(companyId);
    return company.settings;
  }

  async updateSettings(companyId: string, settings: any) {
    return this.prisma.company.update({
      where: { id: companyId },
      data: { settings },
    });
  }
}
