"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Music, Sparkles, TrendingUp, Clock, CreditCard } from "lucide-react"
import Link from "next/link"
import { PricingCards } from "@/components/PricingCards"
import { SongCard } from "@/components/SongCard"
import { EmptyState } from "@/components/EmptyState"

type Song = {
  id: string
  title?: string
  genre?: string
  mood?: string
  created_at: string
  file_url?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [songs, setSongs] = useState<Song[]>([])
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch("/api/songs").then((r) => r.json()).then(setSongs).catch(() => {})
      fetch("/api/user/credits").then((r) => r.json()).then((d) => setCredits(d.credits)).catch(() => {})
    }
  }, [session])

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>
  if (!session) return null

  const recentSongs = songs.slice(0, 4)

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
            Welcome back{session.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted text-sm">Here&apos;s your music overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border">
            <CreditCard className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">{credits} credits</span>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            New Song
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Music, label: "Total Songs", value: songs.length, color: "text-primary-light" },
          { icon: Sparkles, label: "Credits Left", value: credits, color: "text-secondary" },
          { icon: TrendingUp, label: "This Month", value: songs.filter((s) => isThisMonth(s.created_at)).length, color: "text-success" },
          { icon: Clock, label: "Recent", value: songs.filter((s) => isThisWeek(s.created_at)).length, color: "text-warning" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Songs */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]">Recent Songs</h2>
          {songs.length > 0 && (
            <Link href="/library" className="text-sm text-secondary hover:underline">
              View all
            </Link>
          )}
        </div>
        {recentSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentSongs.map((s) => (
              <SongCard key={s.id} {...s} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* Buy More Credits */}
      <section className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-2">
          Need More Credits?
        </h2>
        <p className="text-muted text-sm mb-6">
          Top up your account with a credit pack or subscribe for unlimited generation.
        </p>
        <PricingCards />
      </section>
    </div>
  )
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const weekAgo = now.getTime() - 7 * 86400000
  return d.getTime() > weekAgo
}
