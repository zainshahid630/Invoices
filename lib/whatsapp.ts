// WhatsApp Web.js Service
// This will be initialized when the server starts

let whatsappClient: any = null;
let qrCodeData: string | null = null;
let isReady = false;
let phoneNumber: string | null = null;

export function getWhatsAppClient() {
  return whatsappClient;
}

export function setWhatsAppClient(client: any) {
  whatsappClient = client;
}

export function getQRCode() {
  return qrCodeData;
}

export function setQRCode(qr: string | null) {
  qrCodeData = qr;
}

export function isWhatsAppReady() {
  return isReady;
}

export function setWhatsAppReady(ready: boolean) {
  isReady = ready;
}

export function getPhoneNumber() {
  return phoneNumber;
}

export function setPhoneNumber(number: string | null) {
  phoneNumber = number;
}

export function getWhatsAppStatus() {
  if (isReady && phoneNumber) {
    return 'connected';
  } else if (qrCodeData) {
    return 'qr';
  } else {
    return 'disconnected';
  }
}
