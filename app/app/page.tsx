"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function AppPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <p className="text-gray-600">Sign in to continue your affirmation journey</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full" onClick={() => setIsLoggedIn(true)}>
              Sign In
            </Button>
            <div className="text-center">
              <Button variant="link" className="text-sm">
                Don't have an account? Sign up
              </Button>
            </div>
            <div className="text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Daily Affirmations</h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-sm text-gray-600">Streak: 🔥 7 days</span>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Today's Affirmation */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Today's Affirmation</CardTitle>
            <p className="text-sm text-gray-500">Tuesday, January 7th</p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-xl font-medium text-gray-800 leading-relaxed">
              "I trust my intuition and make decisions with confidence, knowing that I have the wisdom to navigate any
              challenge."
            </p>

            <div className="flex justify-center space-x-4">
              <Button className="flex-1 max-w-32">I Affirmed ✨</Button>
              <Button variant="outline" className="flex-1 max-w-32 bg-transparent">
                Not for Me
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">7</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">23</div>
            <div className="text-xs text-gray-600">Total Affirmed</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-purple-600">92%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </Card>
        </div>

        {/* Coming Soon Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <div>🎯 Goal-based affirmation selection</div>
            <div>🔔 Daily reminder notifications</div>
            <div>🎵 Audio affirmations with custom voices</div>
            <div>📊 Progress tracking and insights</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
