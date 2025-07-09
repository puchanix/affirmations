import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/database"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await createUser(email, hashedPassword, [])

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: name, // We'll add name to the database later
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
