import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';

export class CreateCategoryDto {
  name: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body.name);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
  // eslint-disable-next-line prettier/prettier
  update(@Param('id', ParseIntPipe) id: number, @Body() body: CreateCategoryDto) {
    return this.categoriesService.update(id, body.name);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}