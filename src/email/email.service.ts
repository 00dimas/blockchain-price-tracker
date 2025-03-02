import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.error('SMTP configuration is missing in environment variables.');
      throw new Error('SMTP configuration is incomplete. Please check .env file.');
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendAlertEmail(chain: string, price: number): Promise<void> {
    if (!process.env.ALERT_EMAIL) {
      this.logger.error('ALERT_EMAIL environment variable is not set.');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ALERT_EMAIL,
      subject: `🚀 ALERT: ${chain} Price Increased!`,
      text: `The price of ${chain} has increased to $${price}. Check the market now!`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email alert sent for ${chain}: $${price}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message || JSON.stringify(error)}`);
    }
  }

  async sendPriceEmail(chain: string, price: number, recipientEmail: string): Promise<void> {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.error('SMTP configuration is missing.');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: `📈 Latest ${chain} Price Update`,
      text: `The latest price of ${chain} is $${price}. Check the market now!`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${recipientEmail} with ${chain} price: $${price}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${recipientEmail}: ${(error as Error).message}`);
    }
  }
}
