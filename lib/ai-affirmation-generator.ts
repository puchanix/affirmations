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

export async function generateAffirmations(request: AffirmationRequest): Promise<GeneratedAffirmation[]> {
  const { category, tags, count, tone = "motivational" } = request

  const prompt = `Generate ${count} powerful, personalized affirmations for the category "${category}" with these tags: ${tags.join(", ")}.

Requirements:
- Tone: ${tone}
- Use "I" statements (first person)
- Be specific and actionable when possible
- Avoid clichés - make them feel fresh and personal
- Each should be 10-20 words
- Focus on empowerment and positive action

For each affirmation, also provide:
1. The affirmation text
2. Brief reasoning for why this affirmation would be effective
3. Suggested tags (3-5 relevant tags)

Format as JSON array with objects containing: content, reasoning, tags`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are an expert in positive psychology and affirmation therapy. Create affirmations that are psychologically sound and personally empowering.",
    })

    // Parse the AI response
    const generated = JSON.parse(text)

    return generated.map((item: any) => ({
      content: item.content,
      category,
      tags: item.tags || tags,
      reasoning: item.reasoning,
    }))
  } catch (error) {
    console.error("Error generating affirmations:", error)
    throw new Error("Failed to generate affirmations")
  }
}

export async function categorizeAffirmation(content: string): Promise<{ category: string; tags: string[] }> {
  const prompt = `Analyze this affirmation and suggest the best category and tags:

Affirmation: "${content}"

Available categories: confidence, health, relationships, success, personal-growth, gratitude, happiness, mindset, career, creativity

Provide response as JSON with:
- category: single best category
- tags: array of 3-5 relevant tags`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system: "You are an expert at categorizing personal development content.",
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error categorizing affirmation:", error)
    return { category: "personal-growth", tags: ["general"] }
  }
}
