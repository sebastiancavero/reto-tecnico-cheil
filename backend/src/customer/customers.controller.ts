import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';

export class CreateCustomerDto {
  name: string;
  email: string;
  phone?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('customers')
export class CustomersController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  create(@Body() body: CreateCustomerDto) {
    return this.prisma.customer.create({ data: body });
  }

  @Get()
  findAll() {
    return this.prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
  }
}