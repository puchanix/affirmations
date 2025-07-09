import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Extract the actual connection URL from the psql command format
function parseConnectionString(connectionString: string): string {
  if (connectionString.startsWith("postgresql://")) {
    return connectionString
  }
  const match = connectionString.match(/'([^']+)'/)
  if (match) {
    return match[1]
  }
  return connectionString
}

const sql = neon(parseConnectionString(process.env.DATABASE_URL!))

export async function POST() {
  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS affirmations (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        category VARCHAR(100),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(50) DEFAULT 'ai-generated',
        is_active BOOLEAN DEFAULT true
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        goals TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        current_streak INTEGER DEFAULT 0,
        last_affirmation_date DATE
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS user_affirmation_interactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        affirmation_id INTEGER REFERENCES affirmations(id),
        shown_date DATE NOT NULL,
        response VARCHAR(20),
        response_time TIMESTAMP,
        effectiveness_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_affirmation_interactions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_interactions_date ON user_affirmation_interactions(shown_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_affirmations_category ON affirmations(category)`
    await sql`CREATE INDEX IF NOT EXISTS idx_affirmations_active ON affirmations(is_active)`

    // Add unique constraint for one affirmation per user per day
    try {
      await sql`
        ALTER TABLE user_affirmation_interactions 
        ADD CONSTRAINT unique_user_affirmation_date 
        UNIQUE (user_id, shown_date)
      `
    } catch (error) {
      // Constraint might already exist
      console.log("Daily constraint may already exist")
    }

    // Insert initial affirmations
    const existingCount = await sql`SELECT COUNT(*) as count FROM affirmations`
    if (existingCount[0].count === "0") {
      await sql`
        INSERT INTO affirmations (content, category, tags) VALUES
        ('I am capable of achieving my goals through consistent action', 'success', ARRAY['goals', 'action', 'capability']),
        ('My body is strong and deserves care and respect', 'health', ARRAY['body', 'self-care', 'strength']),
        ('I choose love and compassion in my relationships', 'relationships', ARRAY['love', 'compassion', 'connection']),
        ('I am worthy of success and abundance', 'confidence', ARRAY['self-worth', 'success', 'abundance']),
        ('Each day I grow stronger and more resilient', 'personal-growth', ARRAY['growth', 'resilience', 'strength']),
        ('I trust my intuition and make decisions with confidence', 'confidence', ARRAY['intuition', 'decisions', 'trust']),
        ('I am grateful for the opportunities in my life', 'gratitude', ARRAY['gratitude', 'opportunities', 'mindfulness']),
        ('My potential is limitless and I embrace new challenges', 'personal-growth', ARRAY['potential', 'challenges', 'growth']),
        ('I deserve happiness and I create it in my life', 'happiness', ARRAY['happiness', 'self-worth', 'creation']),
        ('I am in control of my thoughts and choose positivity', 'mindset', ARRAY['control', 'thoughts', 'positivity'])
      `
    }

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ error: "Failed to initialize database", details: error }, { status: 500 })
  }
}
