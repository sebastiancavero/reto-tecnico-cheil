import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class SesService {
  private ses: SESClient;
  private sender: string;

  constructor() {
    this.ses = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.sender = process.env.SES_SENDER_EMAIL!;
  }

  async sendInvoiceEmail(toEmail: string, invoiceNumber: string, customerName: string, htmlBody: string) {
    await this.ses.send(
      new SendEmailCommand({
        Source: this.sender,
        Destination: { ToAddresses: [toEmail] },
        Message: {
          Subject: {
            Data: `Boleta #${invoiceNumber} — ${customerName}`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
          },
        },
      }),
    );
  }
}