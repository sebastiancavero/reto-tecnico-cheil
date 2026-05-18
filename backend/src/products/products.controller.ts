import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { S3Service } from '../s3/s3.service';
import { AuthGuard } from '@nestjs/passport';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  stock: number;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  categoryId: number;
}

@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.productsService.create(
      body.name,
      body.description!,
      body.price,
      body.stock,
      body.categoryId,
    );
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('No se recibió ningún archivo');
    const imageUrl = await this.s3Service.uploadFile(file);
    return this.productsService.updateImage(id, imageUrl);
  }

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.productsService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: CreateProductDto) {
    return this.productsService.update(
      id,
      body.name,
      body.description!,
      body.price,
      body.stock,
      body.categoryId,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}