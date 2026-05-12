-- Create the users table to store user profiles
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  groups TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT FALSE,
  last_activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on is_active for faster queries
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create an index on last_activated_at for ordering
CREATE INDEX idx_users_last_activated ON users(last_activated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can make this more restrictive later)
CREATE POLICY "Allow all operations for users" ON users
  FOR ALL USING (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: The old active_users table can be dropped if it exists
-- DROP TABLE IF EXISTS active_users;