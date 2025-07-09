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
  goals: string[]
  current_streak: number
  last_affirmation_date: string | null
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
    console.log("Retrieved affirmations:", result.length)
    return result as Affirmation[]
  } catch (error) {
    console.error("Database error in getAllAffirmations:", error)
    throw error
  }
}

export async function createAffirmation(affirmation: Omit<Affirmation, "id" | "created_at">): Promise<Affirmation> {
  try {
    console.log("Creating affirmation in database:", affirmation)

    const result = await sql`
      INSERT INTO affirmations (content, category, tags, created_by, is_active)
      VALUES (${affirmation.content}, ${affirmation.category}, ${affirmation.tags}, ${affirmation.created_by}, ${affirmation.is_active})
      RETURNING *
    `

    console.log("Database insert result:", result)
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
export async function createUser(email: string, passwordHash: string, goals: string[]): Promise<User> {
  const result = await sql`
    INSERT INTO users (email, password_hash, goals)
    VALUES (${email}, ${passwordHash}, ${goals})
    RETURNING id, email, goals, current_streak, last_affirmation_date
  `
  return result[0] as User
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, goals, current_streak, last_affirmation_date
    FROM users 
    WHERE email = ${email}
  `
  return (result[0] as User) || null
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
  `

  // Update user streak
  if (response === "affirmed") {
    await sql`
      UPDATE users 
      SET current_streak = current_streak + 1,
          last_affirmation_date = CURRENT_DATE
      WHERE id = ${userId}
    `
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
