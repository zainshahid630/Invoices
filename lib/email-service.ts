// Email Service using Nodemailer
// Supports SMTP configuration for sending invoices

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean; // true for 465, false for other ports
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  from: {
    name: string;
    address: string;
  };
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private config: SMTPConfig;
  private fromName: string;
  private fromEmail: string;

  constructor(
    smtpHost: string,
    smtpPort: number,
    smtpSecure: string,
    smtpUser: string,
    smtpPassword: string,
    fromEmail: string,
    fromName: string
  ) {
    this.config = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure === 'ssl' || smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    };
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  /**
   * Initialize the email transporter
   */
  private async getTransporter(): Promise<Transporter> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport(this.config);
    }
    return this.transporter;
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to verify SMTP connection',
      };
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<SendEmailResult> {
    try {
      const transporter = await this.getTransporter();

      const mailOptions = {
        from: `"${options.from.name}" <${options.from.address}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        attachments: options.attachments || [],
      };

      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
        details: error,
      };
    }
  }

  /**
   * Send invoice email with PDF attachment
   */
  async sendInvoiceEmail(
    to: string,
    subject: string,
    htmlBody: string,
    pdfBuffer: Buffer,
    invoiceNumber: string
  ): Promise<SendEmailResult> {
    return this.sendEmail({
      from: {
        name: this.fromName,
        address: this.fromEmail,
      },
      to,
      subject,
      html: htmlBody,
      attachments: [
        {
          filename: `Invoice_${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }
}

/**
 * Generate professional HTML email template for invoice
 */
export function generateInvoiceEmailHTML(
  companyName: string,
  companyLogo: string | null,
  customerName: string,
  invoiceNumber: string,
  invoiceDate: string,
  totalAmount: string,
  paymentStatus: string,
  customMessage: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      max-width: 150px;
      max-height: 60px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
    }
    .message {
      color: #666;
      margin-bottom: 25px;
      white-space: pre-wrap;
    }
    .invoice-details {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .invoice-details h3 {
      margin: 0 0 15px 0;
      color: #667eea;
      font-size: 16px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #666;
      font-weight: 500;
    }
    .detail-value {
      color: #333;
      font-weight: 600;
    }
    .amount {
      font-size: 20px;
      color: #667eea;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    .status-paid {
      background-color: #d4edda;
      color: #155724;
    }
    .status-partial {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    .attachment-notice {
      background-color: #e7f3ff;
      border: 1px solid #b3d9ff;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      text-align: center;
    }
    .attachment-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      margin: 5px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px;
      }
      .content {
        padding: 20px 15px;
      }
      .detail-row {
        flex-direction: column;
        gap: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
      <h1>${companyName}</h1>
    </div>
    
    <div class="content">
      <div class="greeting">Dear ${customerName},</div>
      
      <div class="message">${customMessage}</div>
      
      <div class="invoice-details">
        <h3>📄 Invoice Details</h3>
        <div class="detail-row">
          <span class="detail-label">Invoice Number:</span>
          <span class="detail-value">${invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${invoiceDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount:</span>
          <span class="detail-value amount">Rs. ${totalAmount}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="status status-${paymentStatus.toLowerCase()}">${paymentStatus}</span>
        </div>
      </div>
      
      <div class="attachment-notice">
        <div class="attachment-icon">📎</div>
        <strong>Invoice PDF Attached</strong>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
          Please find your invoice attached as a PDF document.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p>This is an automated email. Please do not reply to this message.</p>
      <p style="font-size: 12px; color: #999; margin-top: 15px;">
        © ${new Date().getFullYear()} ${companyName}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Common SMTP providers configuration
 */
export const SMTP_PROVIDERS = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: 'tls',
    instructions: 'Use App Password, not your regular Gmail password. Enable 2FA and generate an App Password.',
  },
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: 'tls',
    instructions: 'Use your Outlook email and password.',
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: 'tls',
    instructions: 'Use App Password. Generate one from Yahoo Account Security.',
  },
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: 'tls',
    instructions: 'Use "apikey" as username and your SendGrid API key as password.',
  },
  mailgun: {
    host: 'smtp.mailgun.org',
    port: 587,
    secure: 'tls',
    instructions: 'Use your Mailgun SMTP credentials from the dashboard.',
  },
  custom: {
    host: '',
    port: 587,
    secure: 'tls',
    instructions: 'Enter your custom SMTP server details.',
  },
};
