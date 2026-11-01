-- Store a name/phone snapshot directly on each survey request row.
--
-- Previously surti_survey_requests only carried a customer_id FK. The
-- dashboard's "Permintaan Survei Atap" tab always showed every entry as an
-- unlabeled "Klien SURTI" because that name was never persisted anywhere —
-- and if the linked customer was later deleted (ON DELETE CASCADE), rows
-- that were never linked (customer_id NULL, e.g. a request made before the
-- customer record finished writing) became permanently unidentifiable.
ALTER TABLE surti_survey_requests
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;
