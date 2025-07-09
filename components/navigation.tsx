import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Daily Affirmations
          </Link>
          <div className="space-x-4">
            <Button asChild variant="ghost">
              <Link href="/app">App</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
