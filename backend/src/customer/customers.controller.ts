import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty({ message: 'El nombre es requerido. ' })
  @IsString()
  @MaxLength(150)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre solo puede contener letras. ' })
  name: string;

  @IsEmail({}, { message: 'El correo no es válido. ' })
  @MaxLength(200)
  email: string;

  @IsOptional()
  @Matches(/^[0-9+\-\s]+$/, { message: 'El teléfono solo puede contener números. ' })
  @MaxLength(20)
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