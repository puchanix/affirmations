import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

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

export async function GET() {
  try {
    // Get affirmation counts by category
    const affirmationCounts = await sql`
      SELECT category, COUNT(*) as count
      FROM affirmations 
      WHERE is_active = true
      GROUP BY category
    `

    // Get user selection counts by goal
    const userCounts = await sql`
      SELECT 
        unnest(goals) as goal,
        COUNT(*) as user_count
      FROM users 
      WHERE goals IS NOT NULL AND array_length(goals, 1) > 0
      GROUP BY unnest(goals)
    `

    // Combine the data
    const stats = {}

    // Initialize with affirmation counts
    affirmationCounts.forEach((row) => {
      stats[row.category] = {
        affirmationCount: Number(row.count),
        userCount: 0,
      }
    })

    // Add user counts
    userCounts.forEach((row) => {
      if (stats[row.goal]) {
        stats[row.goal].userCount = Number(row.user_count)
      } else {
        stats[row.goal] = {
          affirmationCount: 0,
          userCount: Number(row.user_count),
        }
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching area stats:", error)
    return NextResponse.json({})
  }
}
