import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const {
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_password,
      smtp_from_email,
      smtp_from_name,
    } = await request.json();

    // Validate required fields
    if (!smtp_host || !smtp_user || !smtp_password || !smtp_from_email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields. Please fill in all SMTP configuration fields.' 
        },
        { status: 400 }
      );
    }

    // Initialize email service with provided credentials
    const emailService = new EmailService(
      smtp_host,
      smtp_port || 587,
      smtp_secure || 'tls',
      smtp_user,
      smtp_password,
      smtp_from_email,
      smtp_from_name || 'Test'
    );

    // Test the connection
    const result = await emailService.verifyConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMTP connection successful! Your email settings are working correctly.',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to connect to SMTP server',
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('SMTP test error:', error);
    
    // Provide helpful error messages
    let errorMessage = error.message || 'Failed to test SMTP connection';
    
    if (errorMessage.includes('Invalid login') || errorMessage.includes('535')) {
      if (errorMessage.includes('basic authentication is disabled') || errorMessage.includes('5.7.139')) {
        errorMessage = '🔒 Outlook/Microsoft: Basic authentication is disabled. You need to:\n1. Enable 2-Factor Authentication on your Microsoft account\n2. Generate an App Password\n3. Use the App Password instead of your regular password\n\nGuide: Check OUTLOOK_EMAIL_SETUP_GUIDE.md';
      } else {
        errorMessage = 'Authentication failed. Please check your username and password.\n\nFor Gmail/Outlook: Use an App Password, not your regular password.\nFor SendGrid: Use "apikey" as username and your API key as password.';
      }
    } else if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Connection refused. Please check your SMTP host and port.';
    } else if (errorMessage.includes('ETIMEDOUT')) {
      errorMessage = 'Connection timeout. Please check your SMTP host and firewall settings.';
    } else if (errorMessage.includes('ENOTFOUND')) {
      errorMessage = 'SMTP host not found. Please check the hostname.';
    } else if (errorMessage.includes('EAUTH')) {
      errorMessage = 'Authentication error. For Outlook/Gmail, you must use an App Password. Regular passwords are not supported.';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
