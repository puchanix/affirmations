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

export interface Affirmation {
  id: number
  content: string
  category: string
  tags: string[]
  created_at: string
  created_by: string
  is_active: boolean
}

export interface User {
  id: number
  email: string
  name?: string
  goals: string[]
  current_streak: number
  last_affirmation_date: string | null
  password_hash?: string
}

export interface UserInteraction {
  id: number
  user_id: number
  affirmation_id: number
  shown_date: string
  response: "affirmed" | "not_for_me" | null
  effectiveness_score: number | null
}

// Affirmation functions
export async function getAllAffirmations(): Promise<Affirmation[]> {
  try {
    const result = await sql`
      SELECT * FROM affirmations 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `
    return result as Affirmation[]
  } catch (error) {
    console.error("Database error in getAllAffirmations:", error)
    throw error
  }
}

export async function createAffirmation(affirmation: Omit<Affirmation, "id" | "created_at">): Promise<Affirmation> {
  try {
    const result = await sql`
      INSERT INTO affirmations (content, category, tags, created_by, is_active)
      VALUES (${affirmation.content}, ${affirmation.category}, ${affirmation.tags}, ${affirmation.created_by}, ${affirmation.is_active})
      RETURNING *
    `
    return result[0] as Affirmation
  } catch (error) {
    console.error("Database error in createAffirmation:", error)
    throw error
  }
}

export async function updateAffirmation(id: number, updates: Partial<Affirmation>): Promise<Affirmation> {
  try {
    const result = await sql`
      UPDATE affirmations 
      SET content = COALESCE(${updates.content}, content),
          category = COALESCE(${updates.category}, category),
          tags = COALESCE(${updates.tags}, tags),
          is_active = COALESCE(${updates.is_active}, is_active)
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Affirmation
  } catch (error) {
    console.error("Database error in updateAffirmation:", error)
    throw error
  }
}

// User functions
export async function createUser(email: string, passwordHash: string, goals: string[], name?: string): Promise<User> {
  // First, let's add the name column if it doesn't exist
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)`
  } catch (error) {
    // Column might already exist, that's okay
  }

  const result = await sql`
    INSERT INTO users (email, password_hash, goals, name)
    VALUES (${email}, ${passwordHash}, ${goals}, ${name})
    RETURNING id, email, name, goals, current_streak, last_affirmation_date
  `
  return result[0] as User
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const result = await sql`
    SELECT id, email, name, goals, current_streak, last_affirmation_date, password_hash
    FROM users 
    WHERE email = ${email}
  `
  return (result[0] as User & { password_hash: string }) || null
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, goals, current_streak, last_affirmation_date
    FROM users 
    WHERE id = ${id}
  `
  return (result[0] as User) || null
}

export async function updateUserStreak(userId: number, increment = true): Promise<void> {
  if (increment) {
    await sql`
      UPDATE users 
      SET current_streak = current_streak + 1,
          last_affirmation_date = CURRENT_DATE
      WHERE id = ${userId}
    `
  } else {
    await sql`
      UPDATE users 
      SET current_streak = 0,
          last_affirmation_date = CURRENT_DATE
      WHERE id = ${userId}
    `
  }
}

// User interaction functions
export async function recordUserInteraction(
  userId: number,
  affirmationId: number,
  response: "affirmed" | "not_for_me",
): Promise<void> {
  await sql`
    INSERT INTO user_affirmation_interactions (user_id, affirmation_id, shown_date, response, response_time)
    VALUES (${userId}, ${affirmationId}, CURRENT_DATE, ${response}, NOW())
    ON CONFLICT (user_id, affirmation_id, shown_date) 
    DO UPDATE SET response = ${response}, response_time = NOW()
  `

  // Update user streak
  if (response === "affirmed") {
    await updateUserStreak(userId, true)
  }
}

export async function getUserInteractions(userId: number): Promise<UserInteraction[]> {
  const result = await sql`
    SELECT * FROM user_affirmation_interactions 
    WHERE user_id = ${userId}
    ORDER BY shown_date DESC
  `
  return result as UserInteraction[]
}

export async function getTodaysInteraction(userId: number): Promise<UserInteraction | null> {
  const result = await sql`
    SELECT * FROM user_affirmation_interactions 
    WHERE user_id = ${userId} 
    AND shown_date = CURRENT_DATE
    ORDER BY created_at DESC
    LIMIT 1
  `
  return (result[0] as UserInteraction) || null
}

export async function getUserStats(userId: number): Promise<{
  totalAffirmations: number
  streak: number
  successRate: number
}> {
  const user = await getUserById(userId)

  const stats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN response = 'affirmed' THEN 1 END) as affirmed
    FROM user_affirmation_interactions 
    WHERE user_id = ${userId}
  `

  const total = Number(stats[0]?.total || 0)
  const affirmed = Number(stats[0]?.affirmed || 0)

  return {
    totalAffirmations: total,
    streak: user?.current_streak || 0,
    successRate: total > 0 ? Math.round((affirmed / total) * 100) : 0,
  }
}
