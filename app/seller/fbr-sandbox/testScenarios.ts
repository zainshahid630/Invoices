export interface FBRTestScenario {
  id: string;
  name: string;
  payload: any;
}

// Generate unique invoice reference number
function generateInvoiceRefNo(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
}

export const FBR_TEST_SCENARIOS: FBRTestScenario[] = [
  {
    id: 'SN002',
    name: 'SN002 – Goods at Standard Rate to Unregistered Buyers',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "1234567",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      scenarioId: "SN002",
      buyerRegistrationType: "Unregistered",
      items: [{
        hsCode: "0101.2100",
        productDescription: "test",
        rate: "18%",
        uoM: "Numbers, pieces, units",
        quantity: 400,
        totalValues: 0,
        valueSalesExcludingST: 1000,
        fixedNotifiedValueOrRetailPrice: 0.0,
        salesTaxApplicable: 180,
        salesTaxWithheldAtSource: 0,
        extraTax: "",
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Goods at standard rate (default)",
        sroItemSerialNo: ""
      }]
    }
  },
  {
    id: 'SN001',
    name: 'SN001 – Goods at Standard Rate to Registered Buyers',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "3710505701479",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      scenarioId: "SN001",
      buyerRegistrationType: "Registered",
      items: [{
        hsCode: "7214.1010",
        productDescription: "",
        rate: "18%",
        uoM: "MT",
        quantity: 1,
        totalValues: 0,
        valueSalesExcludingST: 205000.0,
        fixedNotifiedValueOrRetailPrice: 0.0,
        salesTaxApplicable: 36900,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Steel melting and re-rolling",
        sroItemSerialNo: ""
      }]
    }
  },
  {
    id: 'SN003',
    name: 'SN003 – Steel Melting and Re-rolling',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "3710505701479",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      scenarioId: "SN003",
      buyerRegistrationType: "Unregistered",
      items: [{
        hsCode: "7214.1010",
        productDescription: "",
        rate: "18%",
        uoM: "MT",
        quantity: 1,
        totalValues: 0,
        valueSalesExcludingST: 205000.0,
        fixedNotifiedValueOrRetailPrice: 0.0,
        salesTaxApplicable: 36900,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Steel melting and re-rolling",
        sroItemSerialNo: ""
      }]
    }
  },
  {
    id: 'SN004',
    name: 'SN004 – Ship Breaking (Uses Reference Seller NTN)',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "3710505701479",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      scenarioId: "SN004",
      buyerRegistrationType: "Unregistered",
      items: [{
        hsCode:"7204.4910",
        productDescription: "",
        rate: "18%",
        uoM: "MT",
        quantity: 1,
        totalValues: 0,
        valueSalesExcludingST: 175000,
        salesTaxApplicable: 31500,
        fixedNotifiedValueOrRetailPrice: 0,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Ship breaking",
        sroItemSerialNo: ""
      }]
    }
  },
  {
    id: 'SN005',
    name: 'SN005 – Reduced Rate Sale',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "1000000000000",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      scenarioId: "SN005",
      buyerRegistrationType: "Unregistered",
      items: [{
        hsCode: "0102.2930",
        productDescription: "product Description41",
        rate: "1%",
        uoM: "Numbers, pieces, units",
        quantity: 1.0,
        totalValues: 0.00,
        valueSalesExcludingST: 1000.00,
        fixedNotifiedValueOrRetailPrice: 0.00,
        salesTaxApplicable: 10,
        salesTaxWithheldAtSource: 50.23,
        extraTax: "",
        furtherTax: 120.00,
        sroScheduleNo: "EIGHTH SCHEDULE Table 1",
        fedPayable: 50.36,
        discount: 56.36,
        saleType: "Goods at Reduced Rate",
        sroItemSerialNo: "82"
      }]
    }
  },
  {
    id: 'SN006',
    name: 'SN006 – Exempt Goods Sale',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "2046004",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      scenarioId: "SN006",
      buyerRegistrationType: "Registered",
      items: [{
        hsCode: "0102.2930",
        productDescription: "product Description41",
        rate: "Exempt",
        uoM: "Numbers, pieces, units",
        quantity: 1.0,
        totalValues: 0.00,
        valueSalesExcludingST: 10,
        fixedNotifiedValueOrRetailPrice: 0.00,
        salesTaxApplicable: 0,
        salesTaxWithheldAtSource: 50.23,
        extraTax: "",
        furtherTax: 120.00,
        sroScheduleNo: "6th Schd Table I",
        fedPayable: 50.36,
        discount: 56.36,
        saleType: "Exempt goods",
        sroItemSerialNo: "100"
      }]
    }
  },
  {
    id: 'SN007',
    name: 'SN007 – Zero Rated Sale',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "3710505701479",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      scenarioId: "SN007",
      buyerRegistrationType: "Unregistered",
      invoiceRefNo: generateInvoiceRefNo(),
      items: [{
        hsCode: "0101.2100",
        productDescription: "test",
        rate: "0%",
        uoM: "Numbers, pieces, units",
        quantity: 100,
        totalValues: 0,
        valueSalesExcludingST: 100,
        salesTaxApplicable: 0,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "327(I)/2008",
        fixedNotifiedValueOrRetailPrice: 0.00,
        fedPayable: 0,
        discount: 0,
        saleType: "Goods at zero-rate",
        sroItemSerialNo: "1"
      }]
    }
  },
  {
    id: 'SN016',
    name: 'SN016 – Processing / Conversion of Goods',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "1000000000078",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      scenarioId: "SN016",
      buyerRegistrationType: "Unregistered",
      items: [{
        hsCode: "0101.2100",
        productDescription: "test",
        rate: "5%",
        uoM: "Numbers, pieces, units",
        quantity: 1,
        totalValues: 0,
        valueSalesExcludingST: 100,
        salesTaxApplicable: 5,
        salesTaxWithheldAtSource: 0,
        fixedNotifiedValueOrRetailPrice: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Processing/Conversion of Goods",
        sroItemSerialNo: ""
      }]
    }
  },
  {
    id: 'SN017',
    name: 'SN017 – Sale of Goods where FED is Charged in ST Mode',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "7000009",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      scenarioId: "SN017",
      buyerRegistrationType: "Unregistered",
      items: [{
        hsCode: "0101.2100",
        productDescription: "TEST",
        rate: "8%",
        uoM: "Numbers, pieces, units",
        quantity: 1,
        valueSalesExcludingST: 100,
        fixedNotifiedValueOrRetailPrice: 0,
        salesTaxApplicable: 8,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        fedPayable: 0,
        discount: 0,
        totalValues: 0,
        saleType: "Goods (FED in ST Mode)",
        sroScheduleNo: "",
        sroItemSerialNo: ""
      }]
    }
  },
  {
    id: 'SN018',
    name: 'SN018 – Sale of Services where FED is Charged in ST Mode',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "1000000000056",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      scenarioId: "SN018",
      buyerRegistrationType: "Unregistered",
      items: [{
        hsCode: "0101.2100",
        productDescription: "TEST",
        rate: "8%",
        uoM: "Numbers, pieces, units",
        quantity: 20,
        totalValues: 0,
        valueSalesExcludingST: 1000,
        salesTaxApplicable: 80,
        fixedNotifiedValueOrRetailPrice: 0,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Services (FED in ST Mode)",
        sroItemSerialNo: ""
      }]
    }
  },
  {
    id: 'SN019',
    name: 'SN019 – Sale of Services',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "1000000000000",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      buyerRegistrationType: "Unregistered",
      scenarioId: "SN019",
      items: [{
        hsCode: "0101.2900",
        productDescription: "TEST",
        rate: "5%",
        uoM: "Numbers, pieces, units",
        quantity: 1,
        totalValues: 0,
        valueSalesExcludingST: 100,
        salesTaxApplicable: 5,
        fixedNotifiedValueOrRetailPrice: 0,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "ICTO TABLE I",
        fedPayable: 0,
        discount: 0,
        saleType: "Services",
        sroItemSerialNo: "1(ii)(ii)(a)"
      }]
    }
  },
  {
    id: 'SN024',
    name: 'SN024 – Goods Sold that are Listed in SRO 297(1)/2023',
    payload: {
      invoiceType: "Sale Invoice",
      invoiceDate: new Date().toISOString().split('T')[0],
      buyerNTNCNIC: "1000000000000",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      buyerRegistrationType: "Unregistered",
      scenarioId: "SN024",
      invoiceRefNo: generateInvoiceRefNo(),
      items: [{
        hsCode: "0101.2100",
        productDescription: "TEST",
        rate: "25%",
        uoM: "Numbers, pieces, units",
        quantity: 123,
        valueSalesExcludingST: 1000,
        fixedNotifiedValueOrRetailPrice: 0,
        salesTaxApplicable: 250,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "297(I)/2023-Table-I",
        fedPayable: 0,
        discount: 0,
        totalValues: 0,
        saleType: "Goods as per SRO.297(I)/2023",
        sroItemSerialNo: "12"
      }]
    }
  }
];
