import { type NextRequest, NextResponse } from "next/server"
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

export async function POST(request: NextRequest) {
  try {
    const { userId, goals } = await request.json()

    if (!userId || !Array.isArray(goals)) {
      return NextResponse.json({ error: "User ID and goals array are required" }, { status: 400 })
    }

    await sql`
      UPDATE users 
      SET goals = ${goals}
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user goals:", error)
    return NextResponse.json({ error: "Failed to update goals" }, { status: 500 })
  }
}
