import { type NextRequest, NextResponse } from "next/server"
import { getTodaysInteraction } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const interaction = await getTodaysInteraction(Number(userId))
    return NextResponse.json({ response: interaction?.response || null })
  } catch (error) {
    console.error("Error fetching today's response:", error)
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 })
  }
}
