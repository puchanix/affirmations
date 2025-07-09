import { type NextRequest, NextResponse } from "next/server"
import { getAllAffirmations, createAffirmation } from "@/lib/database"

export async function GET() {
  try {
    const affirmations = await getAllAffirmations()
    return NextResponse.json(affirmations || [])
  } catch (error) {
    console.error("Error fetching affirmations:", error)
    // Return empty array instead of error to prevent frontend crash
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, category, tags, created_by = "admin", is_active = true } = body

    if (!content || !category) {
      return NextResponse.json({ error: "Content and category are required" }, { status: 400 })
    }

    const affirmation = await createAffirmation({
      content,
      category,
      tags: Array.isArray(tags) ? tags : [],
      created_by,
      is_active,
    })

    return NextResponse.json(affirmation)
  } catch (error) {
    console.error("Error creating affirmation:", error)
    return NextResponse.json({ error: "Failed to create affirmation" }, { status: 500 })
  }
}
