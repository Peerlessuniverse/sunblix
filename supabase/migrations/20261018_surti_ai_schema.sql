-- ============================================================================
-- SUNBLIX SURTI AI — SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Migration: 20261018_surti_ai_schema.sql
-- Description: Core schema, tables, foreign keys, indexes, and RLS policies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & USERS
CREATE TABLE IF NOT EXISTS surti_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'sales', 'technical_reviewer', 'commercial_approver', 'service_staff', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS & CRM LEADS
CREATE TABLE IF NOT EXISTS surti_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES surti_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company_name TEXT,
  customer_type TEXT DEFAULT 'residential' CHECK (customer_type IN ('residential', 'commercial', 'industrial', 'institutional', 'other')),
  city TEXT DEFAULT 'Jabodetabek',
  address TEXT,
  monthly_bill NUMERIC(15, 2) DEFAULT 0.00,
  stage TEXT DEFAULT 'NEW_LEAD' CHECK (stage IN ('NEW_LEAD', 'QUALIFIED', 'SPH_PROPOSED', 'SURVEY_SCHEDULED', 'WON', 'LOST')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERSISTENT MEMORY: CUSTOMER MEMORIES (4-LAYERS)
CREATE TABLE IF NOT EXISTS surti_customer_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES surti_customers(id) ON DELETE CASCADE,
  memory_layer TEXT NOT NULL CHECK (memory_layer IN ('working', 'episodic', 'semantic', 'operational')),
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  confidence NUMERIC(3, 2) DEFAULT 1.00,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONVERSATIONS & CHAT HISTORY
CREATE TABLE IF NOT EXISTS surti_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES surti_customers(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  channel TEXT DEFAULT 'web_chat' CHECK (channel IN ('web_chat', 'voice_call', 'whatsapp')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS surti_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES surti_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  tool_calls JSONB,
  tool_results JSONB,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SOLAR CALCULATIONS & PROJECT ASSESSMENTS
CREATE TABLE IF NOT EXISTS surti_project_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES surti_customers(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL,
  system_type TEXT NOT NULL,
  monthly_bill NUMERIC(15, 2) NOT NULL,
  kwp NUMERIC(8, 2) NOT NULL,
  panel_count INT NOT NULL,
  panel_model TEXT NOT NULL,
  inverter_model TEXT NOT NULL,
  battery_capacity TEXT,
  estimated_investment NUMERIC(15, 2) NOT NULL,
  estimated_monthly_savings NUMERIC(15, 2) NOT NULL,
  payback_years NUMERIC(4, 1) NOT NULL,
  monthly_kwh INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SPH (SURAT PENAWARAN HARGA) & LINE ITEMS
CREATE TABLE IF NOT EXISTS surti_quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES surti_customers(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES surti_project_assessments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'revision_requested', 'approved', 'issued', 'expired', 'cancelled')),
  dpp NUMERIC(15, 2) NOT NULL,
  ppn NUMERIC(15, 2) NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL,
  is_demo BOOLEAN DEFAULT TRUE,
  created_by TEXT NOT NULL DEFAULT 'SURTI AI',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ NOT NULL,
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS surti_quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID REFERENCES surti_quotations(id) ON DELETE CASCADE,
  item_number INT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  qty INT NOT NULL,
  unit TEXT NOT NULL,
  subtotal NUMERIC(15, 2) NOT NULL
);

-- 7. SURVEY REQUESTS
CREATE TABLE IF NOT EXISTS surti_survey_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES surti_customers(id) ON DELETE CASCADE,
  site_address TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  roof_type TEXT,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'under_review', 'confirmed', 'reschedule_requested', 'completed', 'cancelled')),
  assigned_engineer TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SERVICE TICKETS & HUMAN HANDOFF
CREATE TABLE IF NOT EXISTS surti_service_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES surti_customers(id) ON DELETE CASCADE,
  ticket_number TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_staff TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS surti_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE surti_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE surti_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE surti_customer_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE surti_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE surti_survey_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE surti_service_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can only access their own records
CREATE POLICY customer_own_profile ON surti_profiles
  FOR ALL USING (auth.uid() = auth_user_id);

CREATE POLICY customer_own_memories ON surti_customer_memories
  FOR ALL USING (customer_id IN (SELECT id FROM surti_customers WHERE profile_id IN (SELECT id FROM surti_profiles WHERE auth_user_id = auth.uid())));

-- Policy: Staff & Admin have full access
CREATE POLICY staff_full_access_quotations ON surti_quotations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM surti_profiles
      WHERE auth_user_id = auth.uid()
      AND role IN ('sales', 'technical_reviewer', 'commercial_approver', 'admin')
    )
  );

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_surti_memories_customer ON surti_customer_memories(customer_id, memory_layer);
CREATE INDEX IF NOT EXISTS idx_surti_quotations_customer ON surti_quotations(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_surti_surveys_status ON surti_survey_requests(status);
