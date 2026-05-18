/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SesService } from '../ses/ses.service';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ses: SesService,
    private readonly pdf: PdfService,
  ) {}

  async create(
    customerId: number,
    issuedById: number,
    items: { productId: number; quantity: number }[],
    notes?: string,
  ) {
    // Fetch products and validate
    const productIds = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isDeleted: false, stock: { gt: 0 } },
      include: { category: true },
    });

    if (products.length !== items.length) {
      throw new NotFoundException('Uno o más productos no encontrados');
    }

    // Validar stock disponible
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}`);
      }
    }

    // Build invoice items with snapshot
    const invoiceItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        productName: product.name,
        productCategory: product.category.name,
      };
    });

    const total = invoiceItems.reduce((acc, i) => acc + i.subtotal, 0);
    const number = `INV-${Date.now()}`;

    // Fetch customer and user
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Cliente no encontrado');

    const user = await this.prisma.user.findUnique({ where: { id: issuedById } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Create invoice in DB
    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        total,
        notes,
        customerId,
        issuedById,
        items: { create: invoiceItems },
      },
      include: { customer: true, issuedBy: true, items: true },
    });

    // Descontar stock
    await Promise.all(
      invoiceItems.map((item) =>
        this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    // Generate PDF
    const pdfBuffer = await this.pdf.generateInvoicePdf({
      number: invoice.number,
      createdAt: invoice.createdAt,
      issuedBy: invoice.issuedBy.username,
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
        phone: invoice.customer.phone ?? undefined,
      },
      items: invoice.items.map((i) => ({
        productName: i.productName,
        productCategory: i.productCategory,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
      total: Number(invoice.total),
      notes: invoice.notes ?? undefined,
    });

    // Generate HTML for email
    const htmlBody = `
      <h2>Boleta #${invoice.number}</h2>
      <p><strong>Cliente:</strong> ${invoice.customer.name}</p>
      <p><strong>Email:</strong> ${invoice.customer.email}</p>
      <p><strong>Emitido por:</strong> ${invoice.issuedBy.username}</p>
      <p><strong>Fecha:</strong> ${new Date(invoice.createdAt).toLocaleDateString('es-PE')}</p>
      <hr />
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
        <thead>
          <tr style="background:#f0f0f0">
            <th>Producto</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((i) => `
            <tr>
              <td>${i.productName}</td>
              <td>${i.productCategory}</td>
              <td>${i.quantity}</td>
              <td>S/ ${Number(i.unitPrice).toFixed(2)}</td>
              <td>S/ ${Number(i.subtotal).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p><strong>Total: S/ ${Number(invoice.total).toFixed(2)}</strong></p>
      ${invoice.notes ? `<p><strong>Notas:</strong> ${invoice.notes}</p>` : ''}
    `;

    // Send email
    await this.ses.sendInvoiceEmail(
      process.env.SES_SENDER_EMAIL!,
      invoice.number,
      invoice.customer.name,
      htmlBody,
    );

    return {
      id: invoice.id,
      number: invoice.number,
      total: invoice.total,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      customer: invoice.customer,
      issuedBy: { id: invoice.issuedBy.id, username: invoice.issuedBy.username },
      items: invoice.items,
    };
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      include: { customer: true, issuedBy: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, issuedBy: true, items: true },
    });
    if (!invoice) throw new NotFoundException('Boleta no encontrada');
    return invoice;
  }

  async getPdf(id: number): Promise<Buffer> {
    const invoice = await this.findOne(id);
    return this.pdf.generateInvoicePdf({
      number: invoice.number,
      createdAt: invoice.createdAt,
      issuedBy: invoice.issuedBy.username,
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
        phone: invoice.customer.phone ?? undefined,
      },
      items: invoice.items.map((i) => ({
        productName: i.productName,
        productCategory: i.productCategory,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
      total: Number(invoice.total),
      notes: invoice.notes ?? undefined,
    });
  }
}