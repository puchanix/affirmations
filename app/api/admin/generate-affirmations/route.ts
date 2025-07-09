import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface AffirmationRequest {
  category: string
  tags: string[]
  count: number
  tone?: "gentle" | "powerful" | "motivational" | "calming"
}

export interface GeneratedAffirmation {
  content: string
  category: string
  tags: string[]
  reasoning: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, tags, count, tone = "motivational" } = body

    if (!category || !tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: "Category and tags array are required" }, { status: 400 })
    }

    console.log("Generating affirmations with:", { category, tags, count, tone })

    const prompt = `Generate ${count} powerful, personalized affirmations for the category "${category}" with these tags: ${tags.join(", ")}.

Requirements:
- Tone: ${tone}
- Use "I" statements (first person)
- Be specific and actionable when possible
- Avoid clichés - make them feel fresh and personal
- Each should be 10-20 words
- Focus on empowerment and positive action

For each affirmation, provide:
1. The affirmation text
2. Brief reasoning for why this affirmation would be effective
3. Suggested tags (3-5 relevant tags)

Return ONLY a valid JSON array with objects containing: content, reasoning, tags

Example format:
[
  {
    "content": "I trust my abilities and take confident action toward my goals",
    "reasoning": "Combines self-trust with action, creating momentum",
    "tags": ["confidence", "action", "goals", "trust"]
  }
]`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are an expert in positive psychology and affirmation therapy. Create affirmations that are psychologically sound and personally empowering. Always return valid JSON.",
    })

    console.log("AI Response:", text)

    // Clean up the response to ensure it's valid JSON
    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/```json\n?/, "").replace(/\n?```$/, "")
    }
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/, "").replace(/\n?```$/, "")
    }

    let generated
    try {
      generated = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      console.error("Raw text:", text)

      // Fallback: create a simple affirmation if JSON parsing fails
      generated = [
        {
          content: `I am capable of achieving my ${category} goals with confidence and determination`,
          reasoning: "A foundational affirmation that builds self-efficacy and determination",
          tags: tags.slice(0, 3),
        },
      ]
    }

    // Ensure each generated affirmation has the category
    const result = generated.map((item: any) => ({
      content: item.content,
      category,
      tags: Array.isArray(item.tags) ? item.tags : tags,
      reasoning: item.reasoning || "AI-generated affirmation for personal empowerment",
    }))

    console.log("Final result:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating affirmations:", error)
    return NextResponse.json({ error: "Failed to generate affirmations", details: error.message }, { status: 500 })
  }
}
