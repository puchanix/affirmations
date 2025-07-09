import { type NextRequest, NextResponse } from "next/server"
import { generateAffirmations } from "@/lib/ai-affirmation-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, tags, count, tone } = body

    if (!category || !tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: "Category and tags array are required" }, { status: 400 })
    }

    const generated = await generateAffirmations({
      category,
      tags,
      count: count || 5,
      tone: tone || "motivational",
    })

    return NextResponse.json(generated)
  } catch (error) {
    console.error("Error generating affirmations:", error)
    return NextResponse.json({ error: "Failed to generate affirmations" }, { status: 500 })
  }
}
