CREATE TABLE wellbe_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id TEXT DEFAULT 'anonymous'
);

CREATE TABLE carepoints_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  points INT,
  reason TEXT,
  awarded_at TIMESTAMP DEFAULT NOW()
);
