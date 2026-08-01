"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"

const genres = ["Pop", "Rock", "Electronic", "Hip-Hop", "Lo-fi", "Classical", "Jazz", "Folk"]
const moods = ["Happy", "Sad", "Energetic", "Calm", "Dreamy", "Dark", "Romantic", "Epic"]
const tempos = ["Slow (60-80 BPM)", "Medium (90-120 BPM)", "Fast (130-160 BPM)"]
const vocalsOptions = ["Instrumental", "Melodic Vocals (La-la-la)", "Full Vocals"]

export default function CreatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [story, setStory] = useState("")
  const [genre, setGenre] = useState("Pop")
  const [mood, setMood] = useState("Happy")
  const [tempo, setTempo] = useState("Medium (90-120 BPM)")
  const [vocals, setVocals] = useState("Melodic Vocals (La-la-la)")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (step === 1) {
      if (!story.trim()) {
        setError("Please write your story first")
        setLoading(false)
        return
      }
      setStep(2)
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/create-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, genre, mood, tempo, vocals }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        setLoading(false)
        return
      }

      router.push(`/generating/${data.id}`)
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>
  if (!session) return null

  return (
    <div className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-2">
          Create Your Song
        </h1>
        <p className="text-muted text-sm">
          {step === 1 ? "Start by sharing your story idea" : "Pick the vibe for your song"}
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s ? "gradient-bg text-white" : "bg-surface text-muted border border-border"
              }`}
            >
              {s}
            </div>
            {s < 2 && <div className={`w-12 h-0.5 ${step > 1 ? "gradient-bg" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Your Story
              </label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Tell us about a memory, a feeling, or an idea. We'll turn it into a song..."
                rows={8}
                className="w-full rounded-xl border border-border bg-surface p-4 text-sm placeholder:text-muted/40 focus:outline-none focus:border-primary resize-none transition-colors"
              />
              <p className="text-xs text-muted">
                {story.length} characters (recommended: 50-500)
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Genre</label>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      genre === g
                        ? "gradient-bg text-white"
                        : "bg-surface border border-border text-muted hover:border-primary/30"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mood</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      mood === m
                        ? "gradient-bg text-white"
                        : "bg-surface border border-border text-muted hover:border-primary/30"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tempo</label>
              <div className="flex flex-wrap gap-2">
                {tempos.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTempo(t)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      tempo === t
                        ? "gradient-bg text-white"
                        : "bg-surface border border-border text-muted hover:border-primary/30"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vocals</label>
              <div className="flex flex-wrap gap-2">
                {vocalsOptions.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVocals(v)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      vocals === v
                        ? "gradient-bg text-white"
                        : "bg-surface border border-border text-muted hover:border-primary/30"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-sm text-danger">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl border border-border text-muted hover:text-white hover:border-primary transition-colors text-sm font-medium"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-bg text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {step === 1 ? "Checking..." : "Generating..."}
              </>
            ) : step === 1 ? (
              "Choose Vibe"
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Song
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
