"use client"

import { useEffect, useMemo } from "react"
import { Music, Sparkles, Mic, Wrench } from "lucide-react"

type Stage = {
  time: number
  label: string
  desc: string
  icon: typeof Sparkles
}

const STAGES: Stage[] = [
  { time: 0, label: "Warming up the GPU", desc: "Getting the neural engine ready...", icon: Wrench },
  { time: 20, label: "Composing your melody", desc: "Weaving notes from your story...", icon: Music },
  { time: 90, label: "Layering vocals & harmony", desc: "Adding depth and emotion...", icon: Mic },
  { time: 150, label: "Mastering the final mix", desc: "Polishing every frequency...", icon: Sparkles },
  { time: 180, label: "Almost there!", desc: "Your song will appear any second...", icon: Sparkles },
]

type Props = {
  elapsedSeconds: number
}

export function GenerationProgress({ elapsedSeconds }: Props) {
  const stage = useMemo(() => {
    let current = STAGES[0]
    for (const s of STAGES) {
      if (elapsedSeconds >= s.time) current = s
    }
    return current
  }, [elapsedSeconds])

  const activeBars = useMemo(() => {
    const progress = Math.min(elapsedSeconds / 180, 1)
    return Math.floor(progress * 24)
  }, [elapsedSeconds])

  const StageIcon = stage.icon

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
          <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
          <StageIcon className="w-7 h-7 text-white relative" />
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">{stage.label}</h3>
        <p className="text-muted text-sm mt-1">{stage.desc}</p>
      </div>

      <div className="flex items-end gap-1 h-12">
        {Array.from({ length: 24 }).map((_, i) => {
          const height = 20 + Math.sin(i * 0.6 + elapsedSeconds * 0.2) * 20 + Math.random() * 8
          const isActive = i < activeBars
          return (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-500 ${
                isActive ? "bg-gradient-to-t from-primary to-secondary" : "bg-white/10"
              }`}
              style={{ height: `${Math.max(8, height)}%` }}
            />
          )
        })}
      </div>

      <div className="text-xs text-muted">
        Estimated time: ~3 minutes · You&apos;ve waited{" "}
        <span className="text-white font-medium">{formatDuration(elapsedSeconds)}</span>
      </div>
    </div>
  )
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}
