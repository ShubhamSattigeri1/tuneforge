"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SongCard } from "@/components/SongCard"
import { EmptyState } from "@/components/EmptyState"
import { Search, SlidersHorizontal } from "lucide-react"

type Song = {
  id: string
  title?: string
  genre?: string
  mood?: string
  created_at: string
  file_url?: string
}

export default function LibraryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [songs, setSongs] = useState<Song[]>([])
  const [filtered, setFiltered] = useState<Song[]>([])
  const [search, setSearch] = useState("")
  const [genreFilter, setGenreFilter] = useState("All")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch("/api/songs").then((r) => r.json()).then((data) => {
        setSongs(data)
        setFiltered(data)
      }).catch(() => {})
    }
  }, [session])

  useEffect(() => {
    let result = songs
    if (search) {
      result = result.filter((s) =>
        (s.title || "").toLowerCase().includes(search.toLowerCase())
      )
    }
    if (genreFilter !== "All") {
      result = result.filter((s) => s.genre === genreFilter)
    }
    setFiltered(result)
  }, [search, genreFilter, songs])

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>
  if (!session) return null

  const genres = ["All", ...new Set(songs.map((s) => s.genre).filter(Boolean))] as string[]

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
          Your Library
        </h1>
        <p className="text-muted text-sm">{songs.length} song{songs.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm placeholder:text-muted/40 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted" />
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenreFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                genreFilter === g
                  ? "gradient-bg text-white"
                  : "bg-surface border border-border text-muted hover:border-primary/30"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((s) => (
            <SongCard key={s.id} {...s} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
