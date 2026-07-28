"use client"

import { Play, Download, Music } from "lucide-react"
import Link from "next/link"

type SongCardProps = {
  id: string
  title?: string
  genre?: string
  mood?: string
  created_at: string
  file_url?: string
}

export function SongCard({ id, title, genre, mood, created_at, file_url }: SongCardProps) {
  const timeAgo = getTimeAgo(created_at)

  return (
    <Link
      href={`/song/${id}`}
      className="group rounded-xl border border-border bg-surface hover:border-primary/30 transition-all overflow-hidden"
    >
      <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
        <Music className="w-12 h-12 text-muted/30" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate">{title || "Untitled Song"}</p>
        <div className="flex items-center gap-2 mt-1">
          {genre && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">{genre}</span>}
          {mood && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">{mood}</span>}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted">{timeAgo}</span>
          {file_url && (
            <a
              href={file_url}
              download
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg hover:bg-surface-light text-muted hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </Link>
  )
}

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
