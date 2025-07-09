"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Flame, Settings, BarChart3, LogOut, ChevronDown, ChevronUp } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

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
  const [response, setResponse] = useState<"affirmed" | "not_for_me" | null>(null)
  const [stats, setStats] = useState({ totalAffirmations: 0, streak: 0, successRate: 0 })
  const [showSecondary, setShowSecondary] = useState(false)

  const { user, logout } = useAuth()

  useEffect(() => {
    loadTodaysAffirmation()
    if (user) {
      loadUserStats()
      checkTodaysResponse()
    }
  }, [user])

  const loadTodaysAffirmation = async () => {
    try {
      const url = user ? `/api/daily-affirmation?userId=${user.id}` : "/api/daily-affirmation"
      const response = await fetch(url)
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

  const loadUserStats = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/stats?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  const checkTodaysResponse = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/todays-response?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.response) {
          setResponse(data.response)
          setResponded(true)
        }
      }
    } catch (error) {
      console.error("Error checking today's response:", error)
    }
  }

  const handleResponse = async (userResponse: "affirmed" | "not_for_me") => {
    setResponse(userResponse)
    setResponded(true)

    if (user && affirmation) {
      try {
        await fetch("/api/user/response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            affirmationId: affirmation.id,
            response: userResponse,
          }),
        })

        // Reload stats to get updated data
        loadUserStats()
      } catch (error) {
        console.error("Error saving response:", error)
      }
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
      <div className="relative z-10 max-w-md mx-auto px-4 py-6">
        {/* Minimal Header - Just logout for logged in users */}
        <header className="flex justify-end mb-8 pt-4">
          {user && (
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </header>

        {/* Today's Date - Subtle */}
        <div className="text-center mb-6">
          <p className="text-white/50 text-sm font-light">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* MAIN AFFIRMATION - Very Prominent */}
        <div className="mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardContent className="p-8 text-center space-y-8">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>

              <blockquote className="text-white text-xl leading-relaxed font-light min-h-[3rem]">
                "{affirmation?.content}"
              </blockquote>

              {!responded ? (
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={() => handleResponse("affirmed")}
                    className="w-full py-4 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm font-medium"
                  >
                    I Affirm
                  </Button>
                  <Button
                    onClick={() => handleResponse("not_for_me")}
                    variant="ghost"
                    className="w-full py-3 text-white/70 hover:text-white hover:bg-white/10 font-light"
                  >
                    Skip Today
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {response === "affirmed" ? (
                    <div className="text-white text-lg">✨ Affirmed</div>
                  ) : (
                    <div className="text-white/70 text-lg">Skipped</div>
                  )}
                  <p className="text-white/60 text-base">See you tomorrow</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Streak Badge - Only for logged in users */}
        {user && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Flame className="h-4 w-4 text-yellow-300" />
              <span className="text-white text-sm font-medium">{stats.streak} day streak</span>
            </div>
          </div>
        )}

        {/* Collapsible Secondary Content */}
        <div className="space-y-4">
          {/* Show More Button */}
          <div className="text-center">
            <Button
              onClick={() => setShowSecondary(!showSecondary)}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10 flex items-center gap-2"
            >
              {showSecondary ? (
                <>
                  Show Less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  {user ? "Stats & Settings" : "Learn More"} <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Secondary Content - Collapsible */}
          {showSecondary && (
            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
              {/* Registered User Content */}
              {user && (
                <div className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center bg-white/5 rounded-lg p-3">
                      <div className="text-white text-lg font-light">{stats.streak}</div>
                      <div className="text-white/60 text-xs">Streak</div>
                    </div>
                    <div className="text-center bg-white/5 rounded-lg p-3">
                      <div className="text-white text-lg font-light">{stats.totalAffirmations}</div>
                      <div className="text-white/60 text-xs">Total</div>
                    </div>
                    <div className="text-center bg-white/5 rounded-lg p-3">
                      <div className="text-white text-lg font-light">{stats.successRate}%</div>
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
                      <Link href="/onboarding" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Preferences
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* New User Promotional Content */}
              {!user && (
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
          )}
        </div>
      </div>
    </div>
  )
}
