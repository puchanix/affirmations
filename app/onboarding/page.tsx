"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const AFFIRMATION_AREAS = [
  {
    id: "confidence",
    title: "Build Confidence",
    description: "Self-worth, courage, and inner strength",
    icon: "💪",
  },
  {
    id: "success",
    title: "Achieve Success",
    description: "Goals, career growth, and accomplishments",
    icon: "🎯",
  },
  {
    id: "health",
    title: "Improve Health",
    description: "Physical wellness, energy, and vitality",
    icon: "🌱",
  },
  {
    id: "relationships",
    title: "Better Relationships",
    description: "Love, connection, and communication",
    icon: "💝",
  },
  {
    id: "mindset",
    title: "Positive Mindset",
    description: "Optimism, resilience, and mental clarity",
    icon: "🧠",
  },
  {
    id: "creativity",
    title: "Boost Creativity",
    description: "Innovation, inspiration, and artistic flow",
    icon: "🎨",
  },
  {
    id: "personal-growth",
    title: "Personal Growth",
    description: "Self-improvement and life development",
    icon: "🌟",
  },
  {
    id: "gratitude",
    title: "Practice Gratitude",
    description: "Appreciation, mindfulness, and joy",
    icon: "🙏",
  },
]

export default function OnboardingPage() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if not logged in
  if (!user) {
    router.push("/login")
    return null
  }

  const toggleArea = (areaId: string) => {
    setSelectedAreas((prev) => (prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]))
  }

  const handleComplete = async () => {
    if (selectedAreas.length === 0) return

    setLoading(true)
    try {
      await fetch("/api/user/update-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          goals: selectedAreas,
        }),
      })

      router.push("/")
    } catch (error) {
      console.error("Error updating goals:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-purple-main radial-pattern relative overflow-hidden">
      <div className="relative z-10 max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-light text-white mb-2">Show me affirmations to help me...</h1>
          <p className="text-white/70 text-sm">Choose areas you'd like to focus on (select 1-3)</p>
        </div>

        {/* Areas Grid */}
        <div className="space-y-3 mb-8">
          {AFFIRMATION_AREAS.map((area) => {
            const isSelected = selectedAreas.includes(area.id)
            return (
              <Card
                key={area.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected ? "bg-white/20 border-white/40 shadow-lg" : "bg-white/5 border-white/20 hover:bg-white/10"
                }`}
                onClick={() => toggleArea(area.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{area.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{area.title}</h3>
                      <p className="text-white/60 text-sm">{area.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="space-y-4">
          <Button
            onClick={handleComplete}
            disabled={selectedAreas.length === 0 || loading}
            className="w-full py-4 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm font-medium disabled:opacity-50"
          >
            {loading
              ? "Setting up..."
              : `Continue with ${selectedAreas.length} area${selectedAreas.length !== 1 ? "s" : ""}`}
          </Button>

          <div className="text-center">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
