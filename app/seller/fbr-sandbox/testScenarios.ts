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
       buyerNTNCNIC: "2046004",
      buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
      buyerProvince: "Sindh",
      buyerAddress: "Karachi",
      invoiceRefNo: generateInvoiceRefNo(),
      scenarioId: "SN001",
      buyerRegistrationType: "Registered",
      items: [{
        hsCode: "0101.2100",
        productDescription: "",
        rate: "18%",
        uoM: "Numbers, pieces, units",
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
         saleType: "Goods at standard rate (default)",
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
  id: 'SN008',
  name: 'SN008 – Sale Invoice Scenario',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-04-21",
   
    buyerNTNCNIC: "3710505701479",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    sellerAddress: "Karachi",
    invoiceRefNo: "0",
    scenarioId: "SN008",
    buyerRegistrationType: "Unregistered",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "test",
        rate: "18%",
        uoM: "Numbers, pieces, units",
        quantity: 100,
        totalValues: 145,
        valueSalesExcludingST: 0,
        fixedNotifiedValueOrRetailPrice: 1000,
        salesTaxApplicable: 180,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "3rd Schedule Goods",
        sroItemSerialNo: ""
      }
    ]
  }
}
,
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
  id: 'SN026',
  name: 'SN026 – Goods at Standard Rate to Registered Buyers',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-16",
    buyerNTNCNIC: "1000000000078",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "SI-20250421-001",
    scenarioId: "SN026",
  buyerRegistrationType: "Unregistered",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "TEST",
        rate: "18%",
        uoM: "Numbers, pieces, units",
        quantity: 123,
        valueSalesExcludingST: 1000,
        fixedNotifiedValueOrRetailPrice: 0,
        salesTaxApplicable: 180,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        totalValues: 0,
        saleType: "Goods at standard rate (default)",
        sroItemSerialNo: ""
      }
    ]
  }
},
{
  id: 'SN027',
  name: 'SN027 – 3rd Schedule Goods to Registered Buyers',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-10",
    buyerNTNCNIC: "7000006",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "",
    scenarioId: "SN027",
  buyerRegistrationType: "Unregistered",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "test",
        rate: "18%",
        uoM: "Numbers, pieces, units",
        quantity: 1,
        valueSalesExcludingST: 0,
        fixedNotifiedValueOrRetailPrice: 100,
        salesTaxApplicable: 18,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        totalValues: 0,
        saleType: "3rd Schedule Goods",
        sroItemSerialNo: ""
      }
    ]
  }
},
{
  id: 'SN009',
  name: 'SN009 – Cotton Ginners',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-15",
    buyerNTNCNIC: "2046004",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "",
    scenarioId: "SN009",
    buyerRegistrationType: "Registered",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "test",
        rate: "18%",
        uoM: "Numbers, pieces, units",
        quantity: 0,
        totalValues: 2500,
        valueSalesExcludingST: 2500,
        fixedNotifiedValueOrRetailPrice: 0.00,
        salesTaxApplicable: 450,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Cotton ginners",
        sroItemSerialNo: ""
      }
    ]
  }
}
,
{
  id: 'SN010',
  name: 'SN010 – Telecommunication Services',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-15",
    buyerNTNCNIC: "1000000000000",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "SI-20250515-001",
    scenarioId: "SN010",
    buyerRegistrationType: "Unregistered",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "test",
        rate: "17%",
        uoM: "Numbers, pieces, units",
        quantity: 1000,
        totalValues: 0,
        valueSalesExcludingST: 100,
        fixedNotifiedValueOrRetailPrice: 0.00,
        salesTaxApplicable: 17,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Telecommunication services",
        sroItemSerialNo: ""
      }
    ]
  }
},
{
  id: 'SN011',
  name: 'SN011 – Toll Manufacturing',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-26",
    buyerNTNCNIC: "3710505701479",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "",
    scenarioId: "SN011",
    items: [
      {
        hsCode: "7214.9990",
        productDescription: "",
        rate: "18%",
        uoM: "MT",
        quantity: 1,
        totalValues: 205000,
        valueSalesExcludingST: 205000,
        salesTaxApplicable: 36900,
        fixedNotifiedValueOrRetailPrice: 0,
        salesTaxWithheldAtSource: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Toll Manufacturing",
        sroItemSerialNo: ""
      }
    ]
  }
},
{
  id: 'SN012',
  name: 'SN012 – Petroleum Products',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-15",
    buyerNTNCNIC: "1000000000000",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "SI-20250515-001",
    scenarioId: "SN012",
    buyerRegistrationType: "Unregistered",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "TEST",
        rate: "1.43%",
        uoM: "Numbers, pieces, units",
        quantity: 123,
        totalValues: 132,
        valueSalesExcludingST: 100,
        fixedNotifiedValueOrRetailPrice: 0.00,
        salesTaxApplicable: 1.43,
        salesTaxWithheldAtSource: 2,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "1450(I)/2021",
        fedPayable: 0,
        discount: 0,
        saleType: "Petroleum Products",
        sroItemSerialNo: "4"
      }
    ]
  }
},{
  id: 'SN013',
  name: 'SN013 – Electricity Supply to Retailers',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-15",
    buyerNTNCNIC: "1000000000000",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "SI-20250515-001",
    scenarioId: "SN013",
    buyerRegistrationType: "Unregistered",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "TEST",
        rate: "5%",
        uoM: "Numbers, pieces, units",
        quantity: 123,
        totalValues: 212,
        valueSalesExcludingST: 1000,
        fixedNotifiedValueOrRetailPrice: 0.00,
        salesTaxApplicable: 50,
        salesTaxWithheldAtSource: 11,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "1450(I)/2021",
        fedPayable: 0,
        discount: 0,
        saleType: "Electricity Supply to Retailers",
        sroItemSerialNo: "4"
      }
    ]
  }
},

{
  id: 'SN014',
  name: 'SN014 – Gas to CNG Stations',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-15",
    buyerNTNCNIC: "1000000000000",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "SI-20250515-001",
    scenarioId: "SN014",
    buyerRegistrationType: "Unregistered",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "TEST",
        rate: "18%",
        uoM: "Numbers, pieces, units",
        quantity: 123,
        totalValues: 0,
        valueSalesExcludingST: 1000,
        salesTaxApplicable: 180,
        salesTaxWithheldAtSource: 0,
        fixedNotifiedValueOrRetailPrice: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Gas to CNG stations",
        sroItemSerialNo: ""
      }
    ]
  }
},

{
  id: 'SN015',
  name: 'SN015 – Mobile Phones (Ninth Schedule)',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-15",
    buyerNTNCNIC: "1000000000000",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "SI-20250515-001",
    scenarioId: "SN015",
    buyerRegistrationType: "Unregistered",
    additional1: "",
    additional2: "",
    additional3: "",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "TEST",
        rate: "18%",
        uoM: "Numbers, pieces, units",
        quantity: 123,
        totalValues: 0,
        valueSalesExcludingST: 1234,
        salesTaxApplicable: 222.12,
        salesTaxWithheldAtSource: 0,
        fixedNotifiedValueOrRetailPrice: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "NINTH SCHEDULE",
        fedPayable: 0,
        discount: 0,
        saleType: "Mobile Phones",
        sroItemSerialNo: "1(A)"
      }
    ]
  }
},
{
  id: 'SN020',
  name: 'SN020 – Electric Vehicle (1%)',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-04-21",
    buyerNTNCNIC: "1000000000000",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    buyerRegistrationType: "Unregistered",
    scenarioId: "SN020",
    invoiceRefNo: "SI-20250421-001",
    items: [
      {
        hsCode: "0101.2900",
        productDescription: "TEST",
        rate: "1%",
        uoM: "Numbers, pieces, units",
        quantity: 122,
        totalValues: 0,
        valueSalesExcludingST: 1000,
        salesTaxApplicable: 10,
        salesTaxWithheldAtSource: 0,
        fixedNotifiedValueOrRetailPrice: 0,
        extraTax: 0,
        furtherTax: 0,
        sroScheduleNo: "6th Schd Table III",
        fedPayable: 0,
        discount: 0,
        saleType: "Electric Vehicle",
        sroItemSerialNo: "20"
      }
    ]
  }
},






{
  id: 'SN028',
  name: 'SN028 – Goods at Reduced Rate',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-16",
    buyerNTNCNIC: "1000000000000",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "",
    scenarioId: "SN028",
  buyerRegistrationType: "Unregistered",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "TEST",
        rate: "1%",
        uoM: "Numbers, pieces, units",
        quantity: 1,
        valueSalesExcludingST: 99.01,
        fixedNotifiedValueOrRetailPrice: 100,
        salesTaxApplicable: 0.99,
        salesTaxWithheldAtSource: 0,
       extraTax: "",
        furtherTax: 0,
        sroScheduleNo: "EIGHTH SCHEDULE Table 1",
        fedPayable: 0,
        discount: 0,
        totalValues: 100,
        saleType: "Goods at Reduced Rate",
        sroItemSerialNo: "70"
      }
    ]
  }
}
,
{
  id: 'SN021',
  name: 'SN021 – Scenario SN021',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-04-21",
    buyerNTNCNIC: "1000000000000",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    buyerRegistrationType: "Unregistered",
    scenarioId: "SN021",
    invoiceRefNo: "SI-20250421-001",
    items: [{
      hsCode: "0101.2100",
      productDescription: "TEST",
      rate: "Rs.3 per unit",
      uoM: "Numbers, pieces, units",
      quantity: 12,
      valueSalesExcludingST: 123,
      fixedNotifiedValueOrRetailPrice: 3,
      salesTaxApplicable: 36,
      salesTaxWithheldAtSource: 0,
      extraTax: 0,
      furtherTax: 0,
      sroScheduleNo: "",
      fedPayable: 0,
      discount: 0,
      totalValues: 0,
      saleType: "Cement /Concrete Block",
      sroItemSerialNo: ""
    }]
  }
},
{
  id: 'SN022',
  name: 'SN022 – Scenario SN022',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-04-21",
    buyerNTNCNIC: "1000000000000",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    buyerRegistrationType: "Unregistered",
    scenarioId: "SN022",
    invoiceRefNo: "SI-20250421-001",
    items: [{
      hsCode: "3104.2000",
      productDescription: "TEST",
      rate: "18% + Rs.60/kg",
      uoM: "KG",
      quantity: 1,
      valueSalesExcludingST: 100,
      fixedNotifiedValueOrRetailPrice: 60,
      salesTaxApplicable: 78,
      salesTaxWithheldAtSource: 0,
      extraTax: 0,
      furtherTax: 0,
      sroScheduleNo: "EIGHTH SCHEDULE Table 1",
      fedPayable: 0,
      discount: 0,
      totalValues: 0,
      saleType: "Potassium Chlorate",
      sroItemSerialNo: "56"
    }]
  }
},
{
  id: 'SN023',
  name: 'SN023 – Scenario SN023',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-04-21",
    buyerNTNCNIC: "1000000000000",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    buyerRegistrationType: "Unregistered",
    scenarioId: "SN023",
    invoiceRefNo: "SI-20250421-001",
    items: [{
      hsCode: "0101.2100",
      productDescription: "TEST",
      rate: "Rs.200/unit",
      uoM: "Numbers, pieces, units",
      quantity: 123,
      valueSalesExcludingST: 234,
      fixedNotifiedValueOrRetailPrice: 200,
      salesTaxApplicable: 24600,
      salesTaxWithheldAtSource: 0,
      extraTax: 0,
      furtherTax: 0,
      sroScheduleNo: "581(1)/2024",
      fedPayable: 0,
      discount: 0,
      totalValues: 0,
      saleType: "CNG Sales",
      sroItemSerialNo: "Region-I"
    }]
  }
},
{
  id: 'SN025',
  name: 'SN025 – Scenario SN025',
  payload: {
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-16",
    buyerNTNCNIC: "1000000000078",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    buyerRegistrationType: "Unregistered",
    scenarioId: "SN025",
    invoiceRefNo: "",
    items: [{
      hsCode: "0101.2100",
      productDescription: "TEST",
      rate: "0%",
      uoM: "Numbers, pieces, units",
      quantity: 1,
      valueSalesExcludingST: 100,
      fixedNotifiedValueOrRetailPrice: 0,
      salesTaxApplicable: 0,
      salesTaxWithheldAtSource: 0,
      extraTax: 0,
      furtherTax: 0,
      sroScheduleNo: "EIGHTH SCHEDULE Table 1",
      fedPayable: 0,
      discount: 0,
      totalValues: 0,
      saleType: "Non-Adjustable Supplies",
      sroItemSerialNo: "81"
    }]
  }
}
,
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

        saleType: "Goods as per SRO.297(|)/2023",
        sroItemSerialNo: "12"
      }]
    }
  }
];
