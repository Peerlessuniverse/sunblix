-- ============================================================================
-- SUNBLIX SURTI AI — MIGRATION 4: CRM APPROVAL GATE
-- Migration: 20261101_crm_approval_gate.sql
-- Description: Separates "SURTI's own working database" (every lead SURTI
--              ever qualifies, regardless of outcome) from "CRM & Leads"
--              (the pipeline Direksi/Admin actually works from). A lead only
--              appears in CRM & Leads once:
--                1. it reached SURVEY_SCHEDULED or SPH_PROPOSED/WON stage, and
--                2. a human (Admin or Direktur/CEO) explicitly approved it —
--                   except leads that came straight from a self-service
--                   website form, which are auto-approved (the customer's own
--                   submission already counts as intent).
-- ============================================================================

ALTER TABLE surti_customers
  ADD COLUMN IF NOT EXISTS crm_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS crm_approved_by TEXT,
  ADD COLUMN IF NOT EXISTS crm_approved_at TIMESTAMPTZ;

-- Website self-service submissions (quote/calculator forms, not SURTI chat)
-- are auto-approved at write time by the app; this backfill only covers rows
-- that predate the column and were not sourced from "SURTI AI Chat".
UPDATE surti_customers
SET crm_approved = TRUE
WHERE crm_approved IS DISTINCT FROM TRUE
  AND (notes IS NULL OR notes NOT ILIKE 'Source: SURTI AI Chat%');

CREATE INDEX IF NOT EXISTS idx_surti_customers_crm_approved
  ON surti_customers(crm_approved);
