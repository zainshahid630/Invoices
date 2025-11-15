/**
 * FBR API Client - Uses GoDaddy Proxy
 * 
 * This client calls your GoDaddy proxy instead of FBR directly
 * The proxy uses the whitelisted IP to call FBR
 */

interface FBRProxyConfig {
  proxyUrl: string;
  apiKey: string;
}

interface FBRRequest {
  endpoint: 'validate' | 'post' | 'validate_prod' | 'post_prod';
  token: string;
  data: any;
}

interface FBRResponse {
  invoiceNumber?: string;
  dated?: string;
  validationResponse?: any;
  error?: string;
}

export class FBRProxyClient {
  private config: FBRProxyConfig;

  constructor(config: FBRProxyConfig) {
    this.config = config;
  }

  /**
   * Validate invoice via GoDaddy proxy
   */
  async validateInvoice(token: string, invoiceData: any): Promise<FBRResponse> {
    return this.callProxy({
      endpoint: 'validate',
      token,
      data: invoiceData
    });
  }

  /**
   * Post invoice via GoDaddy proxy
   */
  async postInvoice(token: string, invoiceData: any): Promise<FBRResponse> {
    return this.callProxy({
      endpoint: 'post',
      token,
      data: invoiceData
    });
  }

  /**
   * Validate invoice (production) via GoDaddy proxy
   */
  async validateInvoiceProduction(token: string, invoiceData: any): Promise<FBRResponse> {
    return this.callProxy({
      endpoint: 'validate_prod',
      token,
      data: invoiceData
    });
  }

  /**
   * Post invoice (production) via GoDaddy proxy
   */
  async postInvoiceProduction(token: string, invoiceData: any): Promise<FBRResponse> {
    return this.callProxy({
      endpoint: 'post_prod',
      token,
      data: invoiceData
    });
  }

  /**
   * Call the GoDaddy proxy
   */
  private async callProxy(request: FBRRequest): Promise<FBRResponse> {
    try {
      const response = await fetch(this.config.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('FBR Proxy Error:', error);
      throw new Error(`Failed to call FBR via proxy: ${error.message}`);
    }
  }
}

// Example usage:
// const fbrClient = new FBRProxyClient({
//   proxyUrl: 'https://yourdomain.com/fbr-proxy.php',
//   apiKey: 'your-secret-api-key-here'
// });
//
// const result = await fbrClient.validateInvoice(token, invoiceData);
