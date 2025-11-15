// WhatsApp Business Cloud API Integration
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
}

interface SendMessageParams {
  to: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'document' | 'image' | 'video';
  filename?: string;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export class WhatsAppBusinessAPI {
  private config: WhatsAppConfig;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  /**
   * Send a text message
   */
  async sendTextMessage(to: string, message: string): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'text',
            text: {
              preview_url: false,
              body: message,
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.messages?.[0]?.id,
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to send message',
          details: data.error,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * Send a document (PDF, DOC, etc.)
   */
  async sendDocument(params: SendMessageParams): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: params.to,
            type: 'document',
            document: {
              link: params.mediaUrl,
              filename: params.filename || 'invoice.pdf',
              caption: params.message,
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.messages?.[0]?.id,
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to send document',
          details: data.error,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * Send a template message (pre-approved by Meta)
   */
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string = 'en',
    components?: any[]
  ): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: {
              name: templateName,
              language: {
                code: languageCode,
              },
              components: components || [],
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.messages?.[0]?.id,
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to send template',
          details: data.error,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${messageId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      return { error: 'Failed to get message status' };
    }
  }
}

/**
 * Helper function to format phone number for WhatsApp
 */
export function formatWhatsAppNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing (default to Pakistan +92)
  if (!cleaned.startsWith('92') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  
  return cleaned;
}

/**
 * Validate WhatsApp phone number
 */
export function isValidWhatsAppNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Should be between 10-15 digits
  return cleaned.length >= 10 && cleaned.length <= 15;
}
