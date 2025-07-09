import { type NextRequest, NextResponse } from "next/server"
import { recordUserInteraction } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { userId, affirmationId, response } = await request.json()

    if (!userId || !affirmationId || !response) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await recordUserInteraction(userId, affirmationId, response)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording user response:", error)
    return NextResponse.json({ error: "Failed to record response" }, { status: 500 })
  }
}
