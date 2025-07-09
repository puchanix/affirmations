"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const AFFIRMATION_AREAS = [
  {
    id: "confidence",
    title: "Confidence",
    description: "Build self-worth and inner strength",
    color: "bg-purple-500",
  },
  {
    id: "success",
    title: "Success",
    description: "Achieve goals and grow your career",
    color: "bg-purple-600",
  },
  {
    id: "health",
    title: "Health",
    description: "Improve physical wellness",
    color: "bg-purple-400",
  },
  {
    id: "relationships",
    title: "Relationships",
    description: "Strengthen love and connection",
    color: "bg-purple-700",
  },
  {
    id: "mindset",
    title: "Mindset",
    description: "Develop positive thinking",
    color: "bg-purple-800",
  },
  {
    id: "creativity",
    title: "Creativity",
    description: "Boost innovation and ideas",
    color: "bg-purple-300",
  },
  {
    id: "personal-growth",
    title: "Growth",
    description: "Focus on self-improvement",
    color: "bg-purple-600",
  },
  {
    id: "gratitude",
    title: "Gratitude",
    description: "Practice appreciation daily",
    color: "bg-purple-500",
  },
]

interface AreaStats {
  [key: string]: {
    affirmationCount: number
    userCount: number
  }
}

export default function OnboardingPage() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [areaStats, setAreaStats] = useState<AreaStats>({})
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    loadAreaStats()
  }, [user])

  const loadAreaStats = async () => {
    try {
      const response = await fetch("/api/admin/area-stats")
      if (response.ok) {
        const data = await response.json()
        setAreaStats(data)
      }
    } catch (error) {
      console.error("Error loading area stats:", error)
    }
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
      <div className="relative z-10 max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-light text-white mb-2">Show me affirmations to help me...</h1>
        </div>

        {/* Grid Layout - Headspace Style */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {AFFIRMATION_AREAS.map((area) => {
            const isSelected = selectedAreas.includes(area.id)
            return (
              <div
                key={area.id}
                className={`
                  ${area.color} 
                  rounded-2xl p-6 cursor-pointer transition-all duration-300 
                  hover:scale-105 hover:shadow-xl relative min-h-[120px]
                  flex flex-col justify-between
                  ${isSelected ? "ring-4 ring-white/50 shadow-2xl scale-105" : ""}
                `}
                onClick={() => toggleArea(area.id)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Check className="h-5 w-5 text-purple-600" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-white font-semibold text-lg mb-2 leading-tight">{area.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{area.description}</p>
                </div>

                {/* Subtle decorative element */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-6 right-6 w-4 h-4 bg-white/20 rounded-full"></div>
              </div>
            )
          })}
        </div>

        {/* Selected Areas Summary */}
        {selectedAreas.length > 0 && (
          <div className="text-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-white/80 text-sm mb-3">Selected areas:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {selectedAreas.map((areaId) => {
                  const area = AFFIRMATION_AREAS.find((a) => a.id === areaId)
                  return (
                    <span key={areaId} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                      {area?.title}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="space-y-4">
          <Button
            onClick={handleComplete}
            disabled={selectedAreas.length === 0 || loading}
            className="w-full py-4 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm font-medium disabled:opacity-50 rounded-xl"
          >
            {loading
              ? "Setting up..."
              : selectedAreas.length === 0
                ? "Select at least one area"
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
