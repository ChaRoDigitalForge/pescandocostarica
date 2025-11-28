-- Add password_hash column to users table for JWT authentication
-- This allows users to login with email/password in addition to Firebase

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Make firebase_uid nullable since users can now register without Firebase
ALTER TABLE users ALTER COLUMN firebase_uid DROP NOT NULL;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Add index for last_login_at for analytics
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for JWT authentication';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
