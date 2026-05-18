import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('test-db')
  async testConnection() {
    try {
      const result = await this.prisma.$queryRaw<[{ serverTime: Date }]>`SELECT GETDATE() as serverTime`;
      return {
        status: '🚀 Conexión Exitosa',
        serverTime: result[0].serverTime,
      };
    } catch (error) {
      return {
        status: '❌ Error',
        error: error.message,
      };
    }
  }
}