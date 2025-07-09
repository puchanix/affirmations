-- Create affirmations table
CREATE TABLE IF NOT EXISTS affirmations (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[], -- Array of tags like ['confidence', 'morning', 'career']
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(50) DEFAULT 'ai-generated',
  is_active BOOLEAN DEFAULT true
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  goals TEXT[], -- Array of goals selected during onboarding
  created_at TIMESTAMP DEFAULT NOW(),
  current_streak INTEGER DEFAULT 0,
  last_affirmation_date DATE
);

-- Create user affirmation interactions table
CREATE TABLE IF NOT EXISTS user_affirmation_interactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  affirmation_id INTEGER REFERENCES affirmations(id),
  shown_date DATE NOT NULL,
  response VARCHAR(20), -- 'affirmed' or 'not_for_me'
  response_time TIMESTAMP,
  effectiveness_score DECIMAL(3,2), -- 0.00 to 1.00
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_affirmation_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_date ON user_affirmation_interactions(shown_date);
CREATE INDEX IF NOT EXISTS idx_affirmations_category ON affirmations(category);
CREATE INDEX IF NOT EXISTS idx_affirmations_active ON affirmations(is_active);
