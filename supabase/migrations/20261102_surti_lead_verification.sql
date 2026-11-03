-- Lead verification by SURTI (WhatsApp intake flow).
--
-- SURTI records a lead forwarded by an admin, checks its details, then marks it
-- verified through POST /api/surti/leads/{id}/verify. These columns store who
-- verified it and when. The app tolerates this migration not being applied
-- yet (it falls back to a note), but run it to get a queryable flag.
ALTER TABLE surti_customers
  ADD COLUMN IF NOT EXISTS verified_by TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_surti_customers_verified_at
  ON surti_customers(verified_at);

-- Phone lookups (WhatsApp intake merges repeat messages by phone number).
CREATE INDEX IF NOT EXISTS idx_surti_customers_phone
  ON surti_customers(phone);

-- Durable de-duplication of WhatsApp messages looks up the audit log by
-- (entity_type, entity_id).
CREATE INDEX IF NOT EXISTS idx_surti_audit_logs_entity
  ON surti_audit_logs(entity_type, entity_id);

