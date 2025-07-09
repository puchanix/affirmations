"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Flame, Settings, BarChart3 } from "lucide-react"

interface TodaysAffirmation {
  id: number
  content: string
  category: string
  tags: string[]
}

export default function HomePage() {
  const [affirmation, setAffirmation] = useState<TodaysAffirmation | null>(null)
  const [loading, setLoading] = useState(true)
  const [responded, setResponded] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false) // TODO: Check actual auth status
  const [streak, setStreak] = useState(7)
  const [response, setResponse] = useState<"affirmed" | "not_for_me" | null>(null)

  useEffect(() => {
    loadTodaysAffirmation()
    // TODO: Check if user is logged in
    // setIsRegistered(checkAuthStatus())
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
        content: "I trust my intuition and make decisions with confidence",
        category: "confidence",
        tags: ["intuition", "decisions", "confidence"],
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
        <Sparkles className="h-8 w-8 text-white/60 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-purple-main radial-pattern relative overflow-hidden">
      <div className="relative z-10 max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <header className="text-center pt-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-white" />
            <h1 className="text-xl font-light text-white">Daily Affirmations</h1>
          </div>
          {isRegistered && (
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Flame className="h-4 w-4 text-yellow-300" />
              <span className="text-sm">{streak} day streak</span>
            </div>
          )}
        </header>

        {/* Today's Date */}
        <div className="text-center">
          <p className="text-white/70 text-sm font-light">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Main Affirmation Card */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center space-y-6">
            <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>

            <blockquote className="text-white text-lg leading-relaxed font-light">"{affirmation?.content}"</blockquote>

            {!responded ? (
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleResponse("affirmed")}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm font-medium"
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
              <div className="space-y-3">
                {response === "affirmed" ? (
                  <div className="text-white text-base">✨ Affirmed</div>
                ) : (
                  <div className="text-white/70 text-base">Skipped</div>
                )}
                <p className="text-white/60 text-sm">See you tomorrow</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registered User Content */}
        {isRegistered && responded && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-white text-xl font-light">{streak}</div>
                <div className="text-white/60 text-xs">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-white text-xl font-light">23</div>
                <div className="text-white/60 text-xs">Total</div>
              </div>
              <div className="text-center">
                <div className="text-white text-xl font-light">92%</div>
                <div className="text-white/60 text-xs">Rate</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button
                asChild
                variant="ghost"
                className="flex-1 text-white/70 hover:text-white hover:bg-white/10 border border-white/20"
              >
                <Link href="/stats" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Stats
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="flex-1 text-white/70 hover:text-white hover:bg-white/10 border border-white/20"
              >
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* New User Promotional Content */}
        {!isRegistered && (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <h2 className="text-white text-lg font-light">
                Start your journey <em>today</em>
              </h2>
              <p className="text-white/70 text-sm font-light leading-relaxed">
                Personalized affirmations powered by AI. Build confidence, achieve goals, become your best self.
              </p>
            </div>

            {/* Compact Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <Sparkles className="h-5 w-5 text-white mx-auto mb-1" />
                <div className="text-white text-xs font-medium">AI-Powered</div>
                <div className="text-white/60 text-xs">Smart recommendations</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <Flame className="h-5 w-5 text-white mx-auto mb-1" />
                <div className="text-white text-xs font-medium">Daily Ritual</div>
                <div className="text-white/60 text-xs">Build consistency</div>
              </div>
            </div>

            {/* Sign Up */}
            <Button
              asChild
              className="w-full bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 backdrop-blur-sm font-medium"
            >
              <Link href="/signup">TRY FREE TODAY</Link>
            </Button>

            <div className="text-center">
              <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <Link href="/login">Already have an account?</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Admin Link (bottom) */}
        <div className="text-center pt-4">
          <Button asChild variant="ghost" size="sm" className="text-white/40 hover:text-white/60">
            <Link href="/admin">Admin</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
