"use client"

import { Play, Pause, Loader2 } from "lucide-react"

type WaveformProps = {
  playing: boolean
  currentTime: number
  duration: number
  onTogglePlay: () => void
  loading?: boolean
}

export function Waveform({ playing, currentTime, duration, onTogglePlay, loading }: WaveformProps) {
  const bars = 64
  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onTogglePlay}
        disabled={loading}
        className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
      >
        {loading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : playing ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex items-end gap-0.5 h-16">
        {Array.from({ length: bars }).map((_, i) => {
          const barProgress = i / bars
          const isActive = barProgress <= progress
          const height = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 10

          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-100 ${
                isActive
                  ? "bg-gradient-to-t from-primary to-secondary"
                  : "bg-white/10"
              }`}
              style={{ height: `${height}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}
