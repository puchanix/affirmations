import { NextResponse } from "next/server"
import { getAllAffirmations } from "@/lib/database"

export async function GET() {
  try {
    const affirmations = await getAllAffirmations()

    if (affirmations.length === 0) {
      return NextResponse.json({
        id: 1,
        content: "I am capable of achieving my goals through consistent action and unwavering belief in myself",
        category: "confidence",
        tags: ["goals", "action", "belief"],
      })
    }

    // For now, return a random affirmation
    // Later this will be personalized based on user preferences and history
    const randomIndex = Math.floor(Math.random() * affirmations.length)
    const selectedAffirmation = affirmations[randomIndex]

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
