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

export async function getUserInteractions(userId: number): Promise<UserInteraction[]> {
  const result = await sql`
    SELECT * FROM user_affirmation_interactions 
    WHERE user_id = ${userId}
    ORDER BY shown_date DESC
  `
  return result as UserInteraction[]
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

// Add a new function to get or create today's affirmation for a user
export async function getTodaysAffirmationForUser(
  userId: number,
): Promise<{ affirmation: Affirmation; isNew: boolean }> {
  // Check if user already has an affirmation for today
  const existingInteraction = await sql`
    SELECT uai.*, a.* 
    FROM user_affirmation_interactions uai
    JOIN affirmations a ON uai.affirmation_id = a.id
    WHERE uai.user_id = ${userId} 
    AND uai.shown_date = CURRENT_DATE
    ORDER BY uai.created_at DESC
    LIMIT 1
  `

  if (existingInteraction.length > 0) {
    return {
      affirmation: {
        id: existingInteraction[0].affirmation_id,
        content: existingInteraction[0].content,
        category: existingInteraction[0].category,
        tags: existingInteraction[0].tags,
        created_at: existingInteraction[0].created_at,
        created_by: existingInteraction[0].created_by,
        is_active: existingInteraction[0].is_active,
      },
      isNew: false,
    }
  }

  // Get user's goals for personalization
  const user = await getUserById(userId)
  const userGoals = user?.goals || []

  // Get affirmations that match user's goals, or all if no goals set
  let affirmations: Affirmation[]
  if (userGoals.length > 0) {
    affirmations = await sql`
      SELECT * FROM affirmations 
      WHERE is_active = true 
      AND category = ANY(${userGoals})
      ORDER BY created_at DESC
    `

    // If no affirmations match user goals, fall back to all affirmations
    if (affirmations.length === 0) {
      affirmations = await getAllAffirmations()
    }
  } else {
    affirmations = await getAllAffirmations()
  }

  if (affirmations.length === 0) {
    throw new Error("No affirmations available")
  }

  // Select a random one from the filtered set
  const randomIndex = Math.floor(Math.random() * affirmations.length)
  const selectedAffirmation = affirmations[randomIndex]

  // Create the interaction record (this counts as "seeing" the affirmation)
  await sql`
    INSERT INTO user_affirmation_interactions (user_id, affirmation_id, shown_date, created_at)
    VALUES (${userId}, ${selectedAffirmation.id}, CURRENT_DATE, NOW())
  `

  // Update user's streak and last affirmation date (seeing counts as engagement)
  await sql`
    UPDATE users 
    SET current_streak = current_streak + 1,
        last_affirmation_date = CURRENT_DATE
    WHERE id = ${userId}
  `

  return {
    affirmation: selectedAffirmation,
    isNew: true,
  }
}

// Update the recordUserInteraction to only update response, not create new records
export async function recordUserInteraction(
  userId: number,
  affirmationId: number,
  response: "affirmed" | "not_for_me",
): Promise<void> {
  // Update the existing interaction with the user's response
  await sql`
    UPDATE user_affirmation_interactions 
    SET response = ${response}, response_time = NOW()
    WHERE user_id = ${userId} 
    AND affirmation_id = ${affirmationId} 
    AND shown_date = CURRENT_DATE
  `
}

// Add constraint to prevent duplicate daily interactions
export async function addDailyConstraint(): Promise<void> {
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
}
