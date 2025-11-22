export const testData = {
  superAdmin: {
    username: 'superadmin',
    password: 'Test@123456',
  },
  seller: {
    username: 'Demo@invoice.com',
    password: '123456',
    companyName: 'Test Company Ltd',
    ntn: '1234567-8',
    gst: 'GST-123456',
  },
  customer: {
    name: 'John Doe',
    businessName: 'Doe Enterprises',
    address: '123 Test Street, Karachi',
    ntn: '9876543-2',
    gst: 'GST-987654',
    province: 'Sindh',
  },
  product: {
    name: 'Test Product',
    hsCode: '8471.30.00',
    uom: 'PCS',
    unitPrice: 1000,
    warranty: 12,
    description: 'Test product description',
    stockLevel: 100,
  },
  invoice: {
    type: 'Sales Tax Invoice',
    scenario: 'Standard',
  },
};
