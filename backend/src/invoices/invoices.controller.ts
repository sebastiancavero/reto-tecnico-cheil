import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards, Res } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

export class CreateInvoiceDto {
  customerId: number;
  issuedById: number;
  items: { productId: number; quantity: number }[];
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