import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
