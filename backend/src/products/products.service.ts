import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, description: string, price: number, stock: number, categoryId: number) {
    const existing = await this.prisma.product.findFirst({ where: { name, isDeleted: false } });
    if (existing) throw new ConflictException('Ya existe un producto con ese nombre');

    return this.prisma.product.create({
      data: { name, description, price, stock, categoryId },
      include: { category: true },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { isDeleted: false },
        skip,
        take: limit,
        include: { category: true },
      }),
      this.prisma.product.count({ where: { isDeleted: false } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: number, name: string, description: string, price: number, stock: number, categoryId: number) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { name, description, price, stock, categoryId },
      include: { category: true },
    });
  }

  async updateImage(id: number, imageUrl: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { imageUrl },
      include: { category: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}