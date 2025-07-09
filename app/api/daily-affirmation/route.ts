import { type NextRequest, NextResponse } from "next/server"
import { getAllAffirmations, getTodaysAffirmationForUser } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (userId) {
      // Get user-specific daily affirmation
      const { affirmation } = await getTodaysAffirmationForUser(Number(userId))
      return NextResponse.json({
        id: affirmation.id,
        content: affirmation.content,
        category: affirmation.category,
        tags: affirmation.tags,
      })
    }

    // For non-logged-in users, return a random affirmation (but same one per day)
    const today = new Date().toDateString()
    const affirmations = await getAllAffirmations()

    if (affirmations.length === 0) {
      return NextResponse.json({
        id: 1,
        content: "I am capable of achieving my goals through consistent action and unwavering belief in myself",
        category: "confidence",
        tags: ["goals", "action", "belief"],
      })
    }

    // Use date as seed for consistent daily selection for anonymous users
    const dateHash = today.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    const index = Math.abs(dateHash) % affirmations.length
    const selectedAffirmation = affirmations[index]

    return NextResponse.json({
      id: selectedAffirmation.id,
      content: selectedAffirmation.content,
      category: selectedAffirmation.category,
      tags: selectedAffirmation.tags,
    })
  } catch (error) {
    console.error("Error fetching daily affirmation:", error)

    // Fallback affirmation
    return NextResponse.json({
      id: 1,
      content: "I trust my intuition and make decisions with confidence",
      category: "confidence",
      tags: ["intuition", "decisions", "confidence"],
    })
  }
}
