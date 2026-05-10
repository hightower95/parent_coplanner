-- Create the active_users table
CREATE TABLE active_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  groups TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on is_active for faster queries
CREATE INDEX idx_active_users_is_active ON active_users(is_active);

-- Create an index on last_seen for ordering
CREATE INDEX idx_active_users_last_seen ON active_users(last_seen DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE active_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can make this more restrictive later)
CREATE POLICY "Allow all operations for active_users" ON active_users
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
CREATE TRIGGER update_active_users_updated_at
  BEFORE UPDATE ON active_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();