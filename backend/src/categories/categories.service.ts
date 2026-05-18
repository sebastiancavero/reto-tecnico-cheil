import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    const existing = await this.prisma.category.findUnique({ where: { name } });
    if (existing) throw new ConflictException('La categoría ya existe');

    return this.prisma.category.create({
      data: { name },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      where: { isDeleted: false },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findFirst({
      where: { id, isDeleted: false },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async update(id: number, name: string) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { name },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}