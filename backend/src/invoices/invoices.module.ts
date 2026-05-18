import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SesModule } from '../ses/ses.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PrismaModule, SesModule, PdfModule],
  providers: [InvoicesService],
  controllers: [InvoicesController],
})
export class InvoicesModule {}