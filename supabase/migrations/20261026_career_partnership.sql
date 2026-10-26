-- ============================================================================
-- SUNBLIX — MIGRATION 3: CAREER & PARTNERSHIP INQUIRY TABLES
-- Description: Formulir Career (lamaran kerja) dan Partnership (vendor)
--              kini tercatat permanen di database, bukan hanya log server.
-- ============================================================================

-- 1. CAREER APPLICATIONS (lamaran kerja dari /career)
CREATE TABLE IF NOT EXISTS surti_career_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  position TEXT NOT NULL,
  city TEXT,
  education TEXT,
  experience TEXT,
  skills TEXT,
  portfolio_url TEXT,
  expected_salary TEXT,
  availability TEXT,
  bio TEXT,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'reviewing', 'interview_scheduled', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PARTNERSHIP INQUIRIES (pendaftaran vendor dari /partnership)
CREATE TABLE IF NOT EXISTS surti_partnership_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_number TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  pic_position TEXT,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  category TEXT NOT NULL,
  coverage_area TEXT,
  website TEXT,
  npwp TEXT,
  company_profile_url TEXT,
  past_experience TEXT,
  proposal_description TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'contacted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_career_status ON surti_career_applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partnership_status ON surti_partnership_inquiries(status, created_at DESC);
