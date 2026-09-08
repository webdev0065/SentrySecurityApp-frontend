-- Matches the uploaded SuperAdmin model. Does not overwrite existing accounts.
CREATE TABLE IF NOT EXISTS super_admins (
  id SERIAL PRIMARY KEY,
  account_id VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  profile_photo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
