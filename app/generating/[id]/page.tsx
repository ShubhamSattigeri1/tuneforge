"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import confetti from "canvas-confetti"
import { ArrowLeft, Loader2, Music, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useGenerationPoll } from "@/hooks/useGenerationPoll"
import { GenerationProgress } from "@/components/GenerationProgress"
import { GenreBlender } from "@/components/GenreBlender"

export default function GeneratingPage() {
  const { status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id || ""

  const { status, error, elapsedSeconds } = useGenerationPoll(id, () => {
    fireMusicConfetti()
  })

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/login")
  }, [authStatus, router])

  if (authStatus === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] px-4 py-8 max-w-4xl mx-auto">
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Library
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 mb-6">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-1">
            Brewing your song...
          </h1>
          <p className="text-muted text-sm">
            ACE-Step is composing something special. Play Genre Blender while you wait!
          </p>
        </div>
        <GenerationProgress elapsedSeconds={elapsedSeconds} />
      </div>

      <GenreBlender />

      {status === "failed" && (
        <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 p-5 text-center">
          <Music className="w-10 h-10 text-danger mx-auto mb-3" />
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-1">
            Generation failed
          </h3>
          <p className="text-sm text-muted mb-4">{error || "Something went wrong."}</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Link>
        </div>
      )}
    </div>
  )
}

function fireMusicConfetti() {
  const notes = ["🎵", "🎶", "🎸", "🎹", "🥁", "✨"]
  const colors = ["#a855f7", "#f59e0b", "#ec4899", "#06b6d4"]

  const emojiShapes = notes.map((note) =>
    confetti.shapeFromText({ text: note, scalar: 1.4 })
  )

  const end = Date.now() + 1500

  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      scalar: 1.4,
      shapes: emojiShapes,
      ticks: 200,
      colors,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      scalar: 1.4,
      shapes: emojiShapes,
      ticks: 200,
      colors,
    })
    confetti({
      particleCount: 2,
      spread: 360,
      origin: { x: 0.5, y: 0.4 },
      scalar: 1.8,
      shapes: emojiShapes,
      ticks: 200,
      colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}
