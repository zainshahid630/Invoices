import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// Test companies data
const testCompanies = [
  {
    name: 'Tech Solutions Ltd',
    business_name: 'Tech Solutions Private Limited',
    ntn: '1234567-8',
    strn: 'STRN-001',
    address: '123 Main Street, Block A',
    city: 'Karachi',
    province: 'Sindh',
    phone: '+92-21-1234567',
    email: 'info@techsolutions.pk',
  },
  {
    name: 'Global Traders',
    business_name: 'Global Traders International',
    ntn: '2345678-9',
    strn: 'STRN-002',
    address: '456 Commerce Avenue',
    city: 'Lahore',
    province: 'Punjab',
    phone: '+92-42-2345678',
    email: 'contact@globaltraders.pk',
  },
  {
    name: 'Prime Industries',
    business_name: 'Prime Industries (Pvt) Ltd',
    ntn: '3456789-0',
    strn: 'STRN-003',
    address: '789 Industrial Zone',
    city: 'Faisalabad',
    province: 'Punjab',
    phone: '+92-41-3456789',
    email: 'sales@primeindustries.pk',
  },
  {
    name: 'Metro Enterprises',
    business_name: 'Metro Enterprises Corporation',
    ntn: '4567890-1',
    strn: 'STRN-004',
    address: '321 Business District',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    phone: '+92-51-4567890',
    email: 'info@metroenterprises.pk',
  },
  {
    name: 'Sunrise Trading Co',
    business_name: 'Sunrise Trading Company',
    ntn: '5678901-2',
    strn: 'STRN-005',
    address: '654 Market Road',
    city: 'Rawalpindi',
    province: 'Punjab',
    phone: '+92-51-5678901',
    email: 'contact@sunrisetrading.pk',
  },
  {
    name: 'Elite Textiles',
    business_name: 'Elite Textiles Manufacturing',
    ntn: '6789012-3',
    strn: 'STRN-006',
    address: '987 Textile Mills Area',
    city: 'Multan',
    province: 'Punjab',
    phone: '+92-61-6789012',
    email: 'sales@elitetextiles.pk',
  },
  {
    name: 'Ocean Logistics',
    business_name: 'Ocean Logistics Services',
    ntn: '7890123-4',
    strn: 'STRN-007',
    address: '147 Port Area',
    city: 'Karachi',
    province: 'Sindh',
    phone: '+92-21-7890123',
    email: 'info@oceanlogistics.pk',
  },
  {
    name: 'Smart Electronics',
    business_name: 'Smart Electronics & Appliances',
    ntn: '8901234-5',
    strn: 'STRN-008',
    address: '258 Electronics Market',
    city: 'Lahore',
    province: 'Punjab',
    phone: '+92-42-8901234',
    email: 'support@smartelectronics.pk',
  },
  {
    name: 'Green Agro Farms',
    business_name: 'Green Agro Farms Limited',
    ntn: '9012345-6',
    strn: 'STRN-009',
    address: '369 Agricultural Zone',
    city: 'Sahiwal',
    province: 'Punjab',
    phone: '+92-40-9012345',
    email: 'info@greenagro.pk',
  },
  {
    name: 'Royal Builders',
    business_name: 'Royal Builders & Developers',
    ntn: '0123456-7',
    strn: 'STRN-010',
    address: '741 Construction Site',
    city: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    phone: '+92-91-0123456',
    email: 'contact@royalbuilders.pk',
  },
  {
    name: 'Diamond Jewelers',
    business_name: 'Diamond Jewelers International',
    ntn: '1234560-8',
    strn: 'STRN-011',
    address: '852 Jewelry Market',
    city: 'Karachi',
    province: 'Sindh',
    phone: '+92-21-1234560',
    email: 'sales@diamondjewelers.pk',
  },
  {
    name: 'Fast Food Chain',
    business_name: 'Fast Food Chain Pakistan',
    ntn: '2345601-9',
    strn: 'STRN-012',
    address: '963 Food Street',
    city: 'Lahore',
    province: 'Punjab',
    phone: '+92-42-2345601',
    email: 'franchise@fastfoodchain.pk',
  },
  {
    name: 'Medical Supplies Co',
    business_name: 'Medical Supplies Corporation',
    ntn: '3456012-0',
    strn: 'STRN-013',
    address: '159 Hospital Road',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    phone: '+92-51-3456012',
    email: 'orders@medicalsupplies.pk',
  },
  {
    name: 'Auto Parts Hub',
    business_name: 'Auto Parts Hub (Pvt) Ltd',
    ntn: '4560123-1',
    strn: 'STRN-014',
    address: '357 Auto Market',
    city: 'Gujranwala',
    province: 'Punjab',
    phone: '+92-55-4560123',
    email: 'info@autopartshub.pk',
  },
  {
    name: 'Fashion Boutique',
    business_name: 'Fashion Boutique & Accessories',
    ntn: '5601234-2',
    strn: 'STRN-015',
    address: '468 Fashion Avenue',
    city: 'Karachi',
    province: 'Sindh',
    phone: '+92-21-5601234',
    email: 'style@fashionboutique.pk',
  },
  {
    name: 'Power Energy Ltd',
    business_name: 'Power Energy Solutions Limited',
    ntn: '6012345-3',
    strn: 'STRN-016',
    address: '579 Energy Sector',
    city: 'Quetta',
    province: 'Balochistan',
    phone: '+92-81-6012345',
    email: 'info@powerenergy.pk',
  },
  {
    name: 'Book Publishers',
    business_name: 'Book Publishers & Distributors',
    ntn: '7012345-4',
    strn: 'STRN-017',
    address: '680 Publishing House',
    city: 'Lahore',
    province: 'Punjab',
    phone: '+92-42-7012345',
    email: 'publish@bookpublishers.pk',
  },
  {
    name: 'Furniture Mart',
    business_name: 'Furniture Mart & Interiors',
    ntn: '8012345-5',
    strn: 'STRN-018',
    address: '791 Furniture Plaza',
    city: 'Sialkot',
    province: 'Punjab',
    phone: '+92-52-8012345',
    email: 'sales@furnituremart.pk',
  },
  {
    name: 'Chemical Industries',
    business_name: 'Chemical Industries Pakistan',
    ntn: '9012345-6',
    strn: 'STRN-019',
    address: '802 Industrial Estate',
    city: 'Karachi',
    province: 'Sindh',
    phone: '+92-21-9012345',
    email: 'info@chemicalindustries.pk',
  },
  {
    name: 'Sports Goods Export',
    business_name: 'Sports Goods Export House',
    ntn: '0123456-7',
    strn: 'STRN-020',
    address: '913 Sports Complex',
    city: 'Sialkot',
    province: 'Punjab',
    phone: '+92-52-0123456',
    email: 'export@sportsgoodsexport.pk',
  },
];

// POST - Seed test companies
export async function POST(request: NextRequest) {
  try {
    const results = {
      companies_created: 0,
      subscriptions_created: 0,
      settings_created: 0,
      features_created: 0,
      errors: [] as string[],
    };

    // Insert companies one by one
    for (const companyData of testCompanies) {
      try {
        // Insert company
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            ...companyData,
            is_active: true,
          })
          .select()
          .single();

        if (companyError) {
          results.errors.push(`Company ${companyData.name}: ${companyError.message}`);
          continue;
        }

        results.companies_created++;

        // Insert subscription
        const subscriptionStart = new Date();
        const subscriptionEnd = new Date();
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            company_id: company.id,
            plan_name: 'Professional',
            start_date: subscriptionStart.toISOString().split('T')[0],
            end_date: subscriptionEnd.toISOString().split('T')[0],
            amount: 15000.0,
            status: 'active',
            payment_status: 'paid',
          });

        if (subscriptionError) {
          results.errors.push(`Subscription for ${companyData.name}: ${subscriptionError.message}`);
        } else {
          results.subscriptions_created++;
        }

        // Insert settings
        const { error: settingsError } = await supabase
          .from('settings')
          .insert({
            company_id: company.id,
            invoice_prefix: 'INV',
            invoice_counter: 1,
            default_sales_tax_rate: 18.0,
            default_further_tax_rate: 0.0,
            default_currency: 'PKR',
          });

        if (settingsError) {
          results.errors.push(`Settings for ${companyData.name}: ${settingsError.message}`);
        } else {
          results.settings_created++;
        }

        // Insert feature toggles
        const features = [
          'inventory_management',
          'customer_management',
          'invoice_creation',
          'fbr_integration',
          'payment_tracking',
          'reports',
        ];

        for (const feature of features) {
          const { error: featureError } = await supabase
            .from('feature_toggles')
            .insert({
              company_id: company.id,
              feature_name: feature,
              is_enabled: true,
            });

          if (!featureError) {
            results.features_created++;
          }
        }
      } catch (error: any) {
        results.errors.push(`Error processing ${companyData.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test companies seeded successfully',
      results,
    });
  } catch (error: any) {
    console.error('Error seeding companies:', error);
    return NextResponse.json(
      { error: 'Failed to seed companies', details: error.message },
      { status: 500 }
    );
  }
}

