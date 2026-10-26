-- ============================================================================
-- SUNBLIX SURTI AI — MIGRATION 2: RUNTIME PERSISTENCE UPGRADES
-- Migration: 20261025_runtime_persistence.sql
-- Description: Extends the 20261018 core schema so the Next.js app can record
--              every customer interaction immediately:
--              1. telegram channel support (prep for SURTI Telegram bot)
--              2. memory rows are keyed by runtime customerId (memory_key)
--              3. conversations/messages can exist before a lead is qualified
-- ============================================================================

-- 1. CHANNEL: add telegram (and future channels) to surti_conversations
ALTER TABLE surti_conversations
  DROP CONSTRAINT IF EXISTS surti_conversations_channel_check;
ALTER TABLE surti_conversations
  ADD CONSTRAINT surti_conversations_channel_check
  CHECK (channel IN ('web_chat', 'voice_call', 'whatsapp', 'telegram', 'other'));

-- 2. MEMORY: allow keying by runtime customerId even before customer row exists
--    (the 20261018 schema requires customer_id; app writes customer_id=NULL +
--    memory_key=<customerId> until the lead is qualified, then backfills)
ALTER TABLE surti_customer_memories ALTER COLUMN customer_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_surti_memories_key
  ON surti_customer_memories(memory_key);

-- 3. CONVERSATIONS: allow pre-qualification conversations (customer_id nullable)
ALTER TABLE surti_conversations ALTER COLUMN customer_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_surti_conversations_session
  ON surti_conversations(session_id);

-- 4. MESSAGES: index for history queries
CREATE INDEX IF NOT EXISTS idx_surti_messages_conversation
  ON surti_messages(conversation_id, created_at);

-- 5. CUSTOMERS: unique index for lead dedup on email upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_surti_customers_email
  ON surti_customers(email);
