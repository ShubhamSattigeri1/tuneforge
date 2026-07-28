"use client"

import { Music } from "lucide-react"
import Link from "next/link"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
        <Music className="w-10 h-10 text-muted" />
      </div>
      <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-2">
        No songs yet
      </h2>
      <p className="text-muted mb-8 max-w-sm">
        Create your first song by sharing a story. It only takes a minute.
      </p>
      <Link
        href="/create"
        className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
      >
        Create Your First Song
      </Link>
    </div>
  )
}
