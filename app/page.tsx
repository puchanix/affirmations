import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Sparkles, Target, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-purple-main radial-pattern relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-20 pt-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-light text-white tracking-wide">Daily Affirmations</h1>
          </div>
          <p className="text-white/80 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Transform your mindset with personalized affirmations.
            <br />
            Build confidence, achieve goals, become your best self.
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { icon: Heart, title: "Personalized", desc: "Tailored to your goals" },
            { icon: Target, title: "Goal-Focused", desc: "Aligned with objectives" },
            { icon: Sparkles, title: "AI-Powered", desc: "Smart recommendations" },
            { icon: Users, title: "Daily Ritual", desc: "Consistent practice" },
          ].map((feature, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-center hover:bg-white/15 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <feature.icon className="h-7 w-7 text-white mx-auto mb-3" />
                <CardTitle className="text-white text-base font-medium">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-white/70 text-sm font-light">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-white text-3xl font-light mb-4">
              Start your journey <em className="font-light">today</em>
            </h2>
            <p className="text-white/70 text-lg font-light mb-8 max-w-xl mx-auto">
              Well done for making it here - that's a big first step. See if daily affirmations can change your life
              today.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 backdrop-blur-sm px-8 py-4 text-lg font-medium tracking-wide"
          >
            <Link href="/daily" className="flex items-center gap-2">
              TRY FREE TODAY
            </Link>
          </Button>

          <div className="flex justify-center gap-6 pt-4">
            <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
              <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </div>

        {/* Demo */}
        <div className="mt-24 max-w-sm mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6 text-center space-y-5">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <blockquote className="text-white/90 text-base font-light leading-relaxed">
                "I am capable of achieving my goals through consistent action"
              </blockquote>
              <div className="flex justify-center space-x-4">
                <div className="px-4 py-2 bg-white/10 rounded-full text-white/70 text-sm font-light">I Affirm</div>
                <div className="px-4 py-2 bg-white/5 rounded-full text-white/50 text-sm font-light">Skip</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
