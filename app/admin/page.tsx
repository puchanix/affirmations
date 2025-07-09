"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Wand2, Save, Check } from "lucide-react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Affirmation {
  id: number
  content: string
  category: string
  tags: string[]
  created_by: string
  is_active: boolean
}

interface GeneratedAffirmation {
  content: string
  category: string
  tags: string[]
  reasoning: string
}

const categories = [
  "confidence",
  "health",
  "relationships",
  "success",
  "personal-growth",
  "gratitude",
  "happiness",
  "mindset",
  "career",
  "creativity",
]

export default function AdminPanel() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedAffirmations, setGeneratedAffirmations] = useState<GeneratedAffirmation[]>([])
  const [savedAffirmations, setSavedAffirmations] = useState<Set<string>>(new Set())

  // Generation form state
  const [genCategory, setGenCategory] = useState("")
  const [genTags, setGenTags] = useState("")
  const [genCount, setGenCount] = useState(5)
  const [genTone, setGenTone] = useState<"gentle" | "powerful" | "motivational" | "calming">("motivational")

  // Manual creation state
  const [newContent, setNewContent] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newTags, setNewTags] = useState("")

  const [initializingDb, setInitializingDb] = useState(false)
  const [dbInitialized, setDbInitialized] = useState(false)

  const initializeDatabase = async () => {
    setInitializingDb(true)
    try {
      const response = await fetch("/api/admin/init-db", {
        method: "POST",
      })

      if (response.ok) {
        setDbInitialized(true)
        loadAffirmations()
      } else {
        console.error("Failed to initialize database")
      }
    } catch (error) {
      console.error("Error initializing database:", error)
    } finally {
      setInitializingDb(false)
    }
  }

  useEffect(() => {
    loadAffirmations()
  }, [])

  const loadAffirmations = async () => {
    try {
      const response = await fetch("/api/admin/affirmations")
      if (response.ok) {
        const data = await response.json()
        setAffirmations(Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to load affirmations")
        setAffirmations([])
      }
    } catch (error) {
      console.error("Error loading affirmations:", error)
      setAffirmations([])
    } finally {
      setLoading(false)
    }
  }

  const generateAffirmations = async () => {
    if (!genCategory || !genTags) return

    setGenerating(true)
    // Clear previous generated affirmations and saved state
    setGeneratedAffirmations([])
    setSavedAffirmations(new Set())

    try {
      const response = await fetch("/api/admin/generate-affirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: genCategory,
          tags: genTags.split(",").map((t) => t.trim()),
          count: genCount,
          tone: genTone,
        }),
      })

      const generated = await response.json()
      setGeneratedAffirmations(generated)
    } catch (error) {
      console.error("Error generating affirmations:", error)
    } finally {
      setGenerating(false)
    }
  }

  const saveAffirmation = async (
    affirmation: GeneratedAffirmation | { content: string; category: string; tags: string[] },
    index?: number,
  ) => {
    try {
      const response = await fetch("/api/admin/affirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...affirmation,
          created_by: "admin",
          is_active: true,
        }),
      })

      if (response.ok) {
        loadAffirmations()

        // Mark this generated affirmation as saved
        if (typeof index === "number") {
          setSavedAffirmations((prev) => new Set(prev).add(affirmation.content))
        }

        // Clear form if it was manual creation
        if ("content" in affirmation && affirmation.content === newContent) {
          setNewContent("")
          setNewCategory("")
          setNewTags("")
        }
      }
    } catch (error) {
      console.error("Error saving affirmation:", error)
    }
  }

  const toggleAffirmation = async (id: number, isActive: boolean) => {
    try {
      await fetch(`/api/admin/affirmations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })
      loadAffirmations()
    } catch (error) {
      console.error("Error updating affirmation:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Affirmation Admin Panel</h1>
      </div>

      {affirmations.length === 0 && !loading && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Database Setup Required</h3>
                <p className="text-sm text-blue-700">Initialize your database with tables and sample affirmations.</p>
              </div>
              <Button onClick={initializeDatabase} disabled={initializingDb} className="bg-blue-600 hover:bg-blue-700">
                {initializingDb ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Initialize Database"
                )}
              </Button>
            </div>
            {dbInitialized && <p className="text-sm text-green-700 mt-2">✅ Database initialized successfully!</p>}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manage">Manage Affirmations</TabsTrigger>
          <TabsTrigger value="generate">AI Generator</TabsTrigger>
          <TabsTrigger value="create">Manual Create</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold">Current Affirmations ({affirmations.length})</h2>
            {affirmations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 mb-4">
                    No affirmations found. Create some using the AI Generator or Manual Create tabs.
                  </p>
                  <p className="text-sm text-gray-400">Make sure your database is set up correctly.</p>
                </CardContent>
              </Card>
            ) : (
              affirmations.map((affirmation) => (
                <Card key={affirmation.id} className={!affirmation.is_active ? "opacity-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-lg mb-2">{affirmation.content}</p>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary">{affirmation.category}</Badge>
                          {affirmation.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">Created by: {affirmation.created_by}</p>
                      </div>
                      <Button
                        variant={affirmation.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleAffirmation(affirmation.id, affirmation.is_active)}
                      >
                        {affirmation.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                AI Affirmation Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={genCategory} onValueChange={setGenCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tone</label>
                  <Select value={genTone} onValueChange={(value: any) => setGenTone(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gentle">Gentle</SelectItem>
                      <SelectItem value="powerful">Powerful</SelectItem>
                      <SelectItem value="motivational">Motivational</SelectItem>
                      <SelectItem value="calming">Calming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <Input
                  value={genTags}
                  onChange={(e) => setGenTags(e.target.value)}
                  placeholder="confidence, morning, success"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Count</label>
                <Input
                  type="number"
                  value={genCount}
                  onChange={(e) => setGenCount(Number.parseInt(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>

              <Button
                onClick={generateAffirmations}
                disabled={generating || !genCategory || !genTags}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Affirmations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedAffirmations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Affirmations</h3>
                <p className="text-sm text-gray-600">Review and save the ones you like</p>
              </div>
              {generatedAffirmations.map((affirmation, index) => {
                const isSaved = savedAffirmations.has(affirmation.content)
                return (
                  <Card key={index} className={isSaved ? "border-green-200 bg-green-50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-lg mb-2">{affirmation.content}</p>
                          <div className="flex gap-2 mb-2">
                            <Badge variant="secondary">{affirmation.category}</Badge>
                            {affirmation.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">{affirmation.reasoning}</p>
                        </div>
                        {isSaved ? (
                          <Button size="sm" variant="outline" disabled className="bg-green-100 text-green-700">
                            <Check className="mr-2 h-4 w-4" />
                            Saved
                          </Button>
                        ) : (
                          <Button onClick={() => saveAffirmation(affirmation, index)} size="sm">
                            <Save className="mr-2 h-4 w-4" />
                            Save to Database
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Affirmation Manually
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Affirmation Content</label>
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="I am capable of achieving my goals..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <Input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="confidence, morning, success"
                />
              </div>

              <Button
                onClick={() =>
                  saveAffirmation({
                    content: newContent,
                    category: newCategory,
                    tags: newTags.split(",").map((t) => t.trim()),
                  })
                }
                disabled={!newContent || !newCategory}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Affirmation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
