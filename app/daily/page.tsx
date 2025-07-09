"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Flame } from "lucide-react"
import Link from "next/link"

interface TodaysAffirmation {
  id: number
  content: string
  category: string
  tags: string[]
}

export default function DailyAffirmation() {
  const [affirmation, setAffirmation] = useState<TodaysAffirmation | null>(null)
  const [loading, setLoading] = useState(true)
  const [responded, setResponded] = useState(false)
  const [streak, setStreak] = useState(7)
  const [response, setResponse] = useState<"affirmed" | "not_for_me" | null>(null)

  useEffect(() => {
    loadTodaysAffirmation()
  }, [])

  const loadTodaysAffirmation = async () => {
    try {
      const response = await fetch("/api/daily-affirmation")
      if (response.ok) {
        const data = await response.json()
        setAffirmation(data)
      }
    } catch (error) {
      console.error("Error loading affirmation:", error)
      setAffirmation({
        id: 1,
        content:
          "I trust my intuition and make decisions with confidence, knowing I have the wisdom to navigate any challenge",
        category: "confidence",
        tags: ["intuition", "decisions", "wisdom"],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (userResponse: "affirmed" | "not_for_me") => {
    setResponse(userResponse)
    setResponded(true)

    try {
      await fetch("/api/user-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affirmation_id: affirmation?.id,
          response: userResponse,
        }),
      })
    } catch (error) {
      console.error("Error saving response:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-purple-main radial-pattern flex items-center justify-center">
        <div className="animate-pulse">
          <Sparkles className="h-8 w-8 text-white/60" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-purple-main radial-pattern relative overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-6">
          <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>

          <div className="flex items-center gap-2 text-white">
            <Flame className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">{streak}</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md space-y-8">
            {/* Date */}
            <div className="text-center">
              <p className="text-white/70 text-sm font-light">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Affirmation Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
              <div className="p-8 text-center space-y-8">
                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>

                <blockquote className="text-white text-xl leading-relaxed font-light tracking-wide">
                  "{affirmation?.content}"
                </blockquote>

                {!responded ? (
                  <div className="flex flex-col gap-4 pt-4">
                    <Button
                      onClick={() => handleResponse("affirmed")}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm font-medium py-3"
                    >
                      I Affirm
                    </Button>
                    <Button
                      onClick={() => handleResponse("not_for_me")}
                      variant="ghost"
                      className="w-full text-white/70 hover:text-white hover:bg-white/10 font-light"
                    >
                      Skip
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4">
                    {response === "affirmed" ? (
                      <div className="text-center space-y-4">
                        <div className="text-white text-lg font-light">✨ Affirmed</div>
                        <p className="text-white/70 text-sm">See you tomorrow</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="text-white/70 text-lg font-light">Skipped</div>
                        <p className="text-white/70 text-sm">Tomorrow's will be better</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Stats */}
            {responded && (
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-white text-2xl font-light">{streak}</div>
                  <div className="text-white/60 text-xs uppercase tracking-wider">Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-2xl font-light">23</div>
                  <div className="text-white/60 text-xs uppercase tracking-wider">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-2xl font-light">92%</div>
                  <div className="text-white/60 text-xs uppercase tracking-wider">Rate</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
