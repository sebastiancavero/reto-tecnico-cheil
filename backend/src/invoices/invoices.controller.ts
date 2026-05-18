import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards, Res } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { IsInt, IsOptional, IsString, IsArray, ValidateNested, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  quantity: number;
}

export class CreateInvoiceDto {
  @IsInt()
  customerId: number;

  @IsInt()
  issuedById: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Body() body: CreateInvoiceDto) {
    return this.invoicesService.create(
      body.customerId,
      body.issuedById,
      body.items,
      body.notes,
    );
  }

  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const pdfBuffer = await this.invoicesService.getPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="boleta-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}