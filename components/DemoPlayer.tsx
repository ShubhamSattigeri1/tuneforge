"use client"

import { Play, Pause } from "lucide-react"
import { useState } from "react"

const demos = [
  { title: "Summer Vibes", genre: "Pop", mood: "Happy", emoji: "🌴" },
  { title: "Midnight Drive", genre: "Electronic", mood: "Dreamy", emoji: "🌙" },
  { title: "Rise & Shine", genre: "Lo-fi", mood: "Calm", emoji: "☀️" },
]

export function DemoPlayer() {
  const [playing, setPlaying] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {demos.map((demo, i) => (
        <button
          key={i}
          onClick={() => setPlaying(playing === i ? null : i)}
          className="group relative rounded-2xl border border-border bg-surface p-6 text-left hover:border-primary/30 transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 text-6xl opacity-5 select-none">
            {demo.emoji}
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
              {playing === i ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </div>
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-1">
              {demo.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">
                {demo.genre}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                {demo.mood}
              </span>
            </div>
          </div>

          {playing === i && (
            <div className="flex items-end gap-0.5 h-8 mt-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <div
                  key={j}
                  className="w-1 rounded-full gradient-bg animate-waveform"
                  style={{ animationDelay: `${j * 0.2}s`, height: `${20 + j * 15}%` }}
                />
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
