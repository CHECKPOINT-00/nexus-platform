-- Chạy riêng, ngoài transaction, trên prod:
CREATE INDEX CONCURRENTLY IF NOT EXISTS cases_owner_payment_status_idx
  ON cases (owner_auth_user_id, payment_status);
