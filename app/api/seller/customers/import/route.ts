import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { checkSubscription } from '@/lib/subscription-check';

const supabase = getSupabaseServer();

interface ImportCustomer {
  name: string;
  business_name?: string;
  ntn_number?: string;
  phone_number?: string;
  gst_number?: string;
  address?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, customers } = body;

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({ error: 'Customers array is required' }, { status: 400 });
    }

    // Check subscription status
    const subscriptionStatus = await checkSubscription(company_id);
    if (!subscriptionStatus.isActive) {
      return NextResponse.json(
        { 
          error: subscriptionStatus.message || 'Subscription expired',
          subscription_expired: true,
          subscription: subscriptionStatus.subscription
        },
        { status: 403 }
      );
    }

    const results = {
      total: customers.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as any[],
    };

    // Get existing customers to check for duplicates and updates
    const { data: existingCustomers } = await supabase
      .from('customers')
      .select('id, ntn_cnic, gst_number, name')
      .eq('company_id', company_id);

    // Create maps for quick lookup
    const existingByNTN = new Map(
      existingCustomers?.filter(c => c.ntn_cnic).map(c => [c.ntn_cnic, c]) || []
    );
    const existingByGST = new Map(
      existingCustomers?.filter(c => c.gst_number).map(c => [c.gst_number, c]) || []
    );
    const existingByName = new Map(
      existingCustomers?.map(c => [c.name.toLowerCase(), c]) || []
    );

    const customersToImport = [];
    const customersToUpdate = [];
    const processedNTNs = new Set<string>(); // Track NTNs within current batch
    const processedGSTs = new Set<string>(); // Track GSTs within current batch
    const processedNames = new Set<string>(); // Track names within current batch

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      
      // Validate required fields
      if (!customer.name || customer.name.trim() === '') {
        results.skipped++;
        results.errors.push({
          row: i + 1,
          name: customer.name || 'N/A',
          reason: 'Missing customer name',
        });
        continue;
      }

      const ntnCnic = (customer.ntn_number || customer.ntn_cnic || '').trim();
      const gstNumber = (customer.gst_number || '').trim();
      const nameLower = customer.name.trim().toLowerCase();

      const customerData = {
        name: customer.name.trim(),
        business_name: customer.business_name?.trim() || customer.name.trim(),
        ntn_cnic: ntnCnic || null,
        gst_number: gstNumber || null,
        address: customer.address?.trim() || null,
        phone: customer.phone_number?.trim() || null,
        province: null,
        registration_type: gstNumber ? 'Registered' : 'Unregistered',
        is_active: true,
      };

      // Check if customer exists by NTN (priority)
      let existingCustomer = null;
      if (ntnCnic && existingByNTN.has(ntnCnic)) {
        existingCustomer = existingByNTN.get(ntnCnic);
      }
      // Check by GST if no NTN match
      else if (gstNumber && existingByGST.has(gstNumber)) {
        existingCustomer = existingByGST.get(gstNumber);
      }
      // Check by name if no NTN or GST match
      else if (existingByName.has(nameLower)) {
        existingCustomer = existingByName.get(nameLower);
      }

      // If customer exists, update it
      if (existingCustomer) {
        // Check if already processed in this batch
        if (processedNTNs.has(ntnCnic) || processedGSTs.has(gstNumber) || processedNames.has(nameLower)) {
          results.skipped++;
          results.errors.push({
            row: i + 1,
            name: customer.name,
            reason: 'Duplicate in import batch',
          });
          continue;
        }

        customersToUpdate.push({
          id: existingCustomer.id,
          ...customerData,
          updated_at: new Date().toISOString(),
        });

        // Mark as processed
        if (ntnCnic) processedNTNs.add(ntnCnic);
        if (gstNumber) processedGSTs.add(gstNumber);
        processedNames.add(nameLower);
      } else {
        // Check if already processed in this batch
        if (
          (ntnCnic && processedNTNs.has(ntnCnic)) ||
          (gstNumber && processedGSTs.has(gstNumber)) ||
          processedNames.has(nameLower)
        ) {
          results.skipped++;
          results.errors.push({
            row: i + 1,
            name: customer.name,
            reason: 'Duplicate in import batch',
          });
          continue;
        }

        // New customer - add to import list
        customersToImport.push({
          company_id,
          ...customerData,
        });

        // Mark as processed
        if (ntnCnic) processedNTNs.add(ntnCnic);
        if (gstNumber) processedGSTs.add(gstNumber);
        processedNames.add(nameLower);
      }
    }

    // Process updates first
    if (customersToUpdate.length > 0) {
      let totalUpdated = 0;
      
      for (const customerUpdate of customersToUpdate) {
        const { id, ...updateData } = customerUpdate;
        
        const { error: updateError } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', id)
          .eq('company_id', company_id);

        if (updateError) {
          console.error('Error updating customer:', updateError);
          results.errors.push({
            row: 'Update',
            name: customerUpdate.name,
            reason: `Failed to update: ${updateError.message}`,
          });
        } else {
          totalUpdated++;
        }
      }

      results.updated = totalUpdated;
    }

    // Bulk insert new customers
    if (customersToImport.length > 0) {
      // Insert in batches of 100 to avoid timeout
      const batchSize = 100;
      let totalInserted = 0;

      for (let i = 0; i < customersToImport.length; i += batchSize) {
        const batch = customersToImport.slice(i, i + batchSize);
        
        const { data: insertedCustomers, error: insertError } = await supabase
          .from('customers')
          .insert(batch)
          .select();

        if (insertError) {
          console.error('Error importing customers batch:', insertError);
          // Continue with remaining batches even if one fails
          results.errors.push({
            row: `Batch ${Math.floor(i / batchSize) + 1}`,
            name: 'Batch Insert',
            reason: `Failed to insert batch: ${insertError.message}`,
          });
          continue;
        }

        totalInserted += insertedCustomers?.length || 0;
      }

      results.imported = totalInserted;
    }

    const parts = [];
    if (results.imported > 0) parts.push(`${results.imported} imported`);
    if (results.updated > 0) parts.push(`${results.updated} updated`);
    if (results.skipped > 0) parts.push(`${results.skipped} skipped`);

    const successMessage = parts.length > 0
      ? `Successfully processed: ${parts.join(', ')}.`
      : 'No customers processed.';

    return NextResponse.json({
      success: results.imported > 0 || results.updated > 0,
      message: successMessage,
      results,
    });
  } catch (error: any) {
    console.error('Error in POST /api/seller/customers/import:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
