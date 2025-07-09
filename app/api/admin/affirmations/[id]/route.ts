import { type NextRequest, NextResponse } from "next/server"
import { updateAffirmation } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const updates = await request.json()

    const affirmation = await updateAffirmation(id, updates)
    return NextResponse.json(affirmation)
  } catch (error) {
    console.error("Error updating affirmation:", error)
    return NextResponse.json({ error: "Failed to update affirmation" }, { status: 500 })
  }
}
