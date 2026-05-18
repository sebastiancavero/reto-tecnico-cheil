import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  async generateInvoicePdf(invoice: {
    number: string;
    createdAt: Date;
    issuedBy: string;
    customer: { name: string; email: string; phone?: string };
    items: { productName: string; productCategory: string; quantity: number; unitPrice: number; subtotal: number }[];
    total: number;
    notes?: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text('BOLETA DE VENTA', { align: 'center' });
      doc.fontSize(11).font('Helvetica').text('Cheil Worldwide — Reto Técnico', { align: 'center' });
      doc.moveDown();

      // Invoice info
      doc.fontSize(10).font('Helvetica-Bold').text(`N° Boleta: `, { continued: true }).font('Helvetica').text(invoice.number);
      doc.font('Helvetica-Bold').text(`Fecha: `, { continued: true }).font('Helvetica').text(new Date(invoice.createdAt).toLocaleDateString('es-PE'));
      doc.font('Helvetica-Bold').text(`Emitido por: `, { continued: true }).font('Helvetica').text(invoice.issuedBy);
      doc.moveDown();

      // Customer
      doc.fontSize(11).font('Helvetica-Bold').text('Datos del Cliente');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica-Bold').text('Nombre: ', { continued: true }).font('Helvetica').text(invoice.customer.name);
      doc.font('Helvetica-Bold').text('Email: ', { continued: true }).font('Helvetica').text(invoice.customer.email);
      if (invoice.customer.phone) {
        doc.font('Helvetica-Bold').text('Teléfono: ', { continued: true }).font('Helvetica').text(invoice.customer.phone);
      }
      doc.moveDown();

      // Items table header
      doc.fontSize(11).font('Helvetica-Bold').text('Detalle de Compra');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Producto', 50, doc.y, { width: 180 });
      doc.text('Categoría', 230, doc.y - doc.currentLineHeight(), { width: 120 });
      doc.text('Cant.', 350, doc.y - doc.currentLineHeight(), { width: 50 });
      doc.text('P. Unit.', 400, doc.y - doc.currentLineHeight(), { width: 70 });
      doc.text('Subtotal', 470, doc.y - doc.currentLineHeight(), { width: 80 });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.3);

      // Items
      doc.font('Helvetica').fontSize(9);
      invoice.items.forEach((item) => {
        const y = doc.y;
        doc.text(item.productName, 50, y, { width: 180 });
        doc.text(item.productCategory, 230, y, { width: 120 });
        doc.text(String(item.quantity), 350, y, { width: 50 });
        doc.text(`S/ ${Number(item.unitPrice).toFixed(2)}`, 400, y, { width: 70 });
        doc.text(`S/ ${Number(item.subtotal).toFixed(2)}`, 470, y, { width: 80 });
        doc.moveDown(0.8);
      });

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Total
      doc.fontSize(12).font('Helvetica-Bold').text(`TOTAL: S/ ${Number(invoice.total).toFixed(2)}`, { align: 'right' });

      // Notes
      if (invoice.notes) {
        doc.moveDown();
        doc.fontSize(9).font('Helvetica-Bold').text('Notas: ', { continued: true }).font('Helvetica').text(invoice.notes);
      }

      doc.moveDown(2);
      doc.fontSize(8).font('Helvetica').fillColor('grey').text('Documento generado automáticamente — Cheil Worldwide', { align: 'center' });

      doc.end();
    });
  }
}