-- ============================================
-- QUERY PORTAL TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_queries_company ON queries(company_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at);

-- RLS Policies

-- 1. Sellers can view their own queries
CREATE POLICY "Sellers can view their own queries" ON queries
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE users.id = auth.uid()
    )
  );

-- 2. Sellers can create queries for their company
CREATE POLICY "Sellers can create queries" ON queries
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users
      WHERE users.id = auth.uid()
    )
  );

-- 3. Super Admins can view all queries
-- Note: This assumes Super Admins are handled via a separate mechanism or bypass RLS if using service role. 
-- If Super Admins are in a table and authenticated via Supabase Auth, we need a policy for them.
-- Based on existing schema, super_admins table exists but might not be directly linked to auth.uid() in the same way as users.
-- Usually Super Admin API uses service role key which bypasses RLS.
-- If not, we would need:
-- CREATE POLICY "Super Admins can view all queries" ON queries
--   FOR ALL
--   USING (
--     EXISTS (SELECT 1 FROM super_admins WHERE email = auth.email()) -- Example check
--   );
