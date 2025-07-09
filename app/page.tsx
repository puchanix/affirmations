import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Sparkles, Target, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Daily Affirmations</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your mindset with personalized affirmations delivered daily. Build confidence, achieve goals, and
            become your best self.
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Personalized</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Affirmations tailored to your goals and personality</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Goal-Focused</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Aligned with your personal development objectives</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <CardTitle className="text-lg">AI-Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Smart recommendations that learn from your preferences</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Daily Ritual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Build a consistent practice with streak tracking</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/app">Start Your Journey</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin">Admin Panel</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500">Free to start • No credit card required</p>
        </div>

        {/* Demo Section */}
        <div className="mt-16 max-w-md mx-auto">
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Today's Sample Affirmation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg font-medium text-gray-800 mb-4">
                "I am capable of achieving my goals through consistent action and unwavering belief in myself."
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="default" disabled>
                  I Affirmed ✨
                </Button>
                <Button variant="outline" disabled>
                  Not for Me
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Sign up to get personalized affirmations</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
