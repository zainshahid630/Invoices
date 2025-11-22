-- OPTIMIZED INVOICE STATS FUNCTION
-- Run this in Supabase SQL Editor to create the database function
-- This will make stats calculation 5-10x faster

CREATE OR REPLACE FUNCTION get_invoice_stats_optimized(p_company_id UUID)
RETURNS TABLE (
  total BIGINT,
  draft BIGINT,
  posted BIGINT,
  verified BIGINT,
  total_amount NUMERIC,
  pending_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft,
    COUNT(*) FILTER (WHERE status = 'fbr_posted')::BIGINT as posted,
    COUNT(*) FILTER (WHERE status = 'verified')::BIGINT as verified,
    COALESCE(SUM(total_amount), 0) as total_amount,
    COALESCE(SUM(total_amount) FILTER (WHERE payment_status IN ('pending', 'partial')), 0) as pending_amount
  FROM invoices
  WHERE company_id = p_company_id 
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_invoice_stats_optimized(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_invoice_stats_optimized(UUID) TO service_role;

-- Test the function (replace with your actual company_id)
-- SELECT * FROM get_invoice_stats_optimized('your-company-id-here');
