"use client"

import { useSession } from "next-auth/react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Play, Pause, Download, ArrowLeft, Loader2, Clock, Music, Sparkles } from "lucide-react"
import Link from "next/link"
import { Waveform } from "@/components/Waveform"

type SongData = {
  id: string
  title?: string
  story?: string
  genre?: string
  mood?: string
  tempo?: string
  vocals?: string
  lyrics?: string
  file_url?: string
  status: string
  created_at: string
}

export default function SongPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const isGenerating = searchParams.get("generating") === "true"

  const [song, setSong] = useState<SongData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioLoading, setAudioLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login")
      return
    }
    if (authStatus !== "authenticated") return

    const fetchSong = async () => {
      try {
        const res = await fetch(`/api/songs/${params.id}`)
        if (!res.ok) throw new Error("Song not found")
        const data = await res.json()
        setSong(data)
        setError("")
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSong()
    if (isGenerating) {
      const interval = setInterval(fetchSong, 5000)
      return () => clearInterval(interval)
    }
  }, [authStatus, params.id, router, isGenerating])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) {
      if (!song?.file_url) return
      audioRef.current = new Audio(song.file_url)
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0)
      })
      audioRef.current.addEventListener("ended", () => {
        setPlaying(false)
        setCurrentTime(0)
      })
      audioRef.current.addEventListener("waiting", () => setAudioLoading(true))
      audioRef.current.addEventListener("canplay", () => setAudioLoading(false))
      audioRef.current.addEventListener("error", () => {
        setAudioLoading(false)
        setError("Playback failed — file may be missing")
      })
    }

    if (audioRef.current.paused) {
      setAudioLoading(true)
      audioRef.current.play().then(() => {
        setPlaying(true)
        setAudioLoading(false)
      }).catch(() => {
        setAudioLoading(false)
      })
    } else {
      audioRef.current.pause()
      setPlaying(false)
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          {isGenerating ? "Generating your song..." : "Loading song..."}
        </div>
      </div>
    )
  }

  if (error || !song) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Music className="w-12 h-12 text-muted mb-4" />
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-2">
          {error || "Song not found"}
        </h2>
        <Link href="/library" className="text-secondary hover:underline text-sm">
          Back to Library
        </Link>
      </div>
    )
  }

  const isPending = song.status === "generating" || song.status === "queued"

  if (!isPending && !song.file_url) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Music className="w-12 h-12 text-muted mb-4" />
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-2">
          Song file not ready
        </h2>
        <p className="text-muted text-sm mb-4">
          The audio file is still being processed. Please wait a moment and refresh.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl gradient-bg text-white text-sm hover:opacity-90"
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Library
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-1">
              {song.title || "Untitled Song"}
            </h1>
            <div className="flex items-center gap-2">
              {song.genre && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light">
                  {song.genre}
                </span>
              )}
              {song.mood && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                  {song.mood}
                </span>
              )}
              <span className="text-xs text-muted">
                {new Date(song.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          {song.file_url && (
            <a
              href={song.file_url}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted hover:text-white hover:border-primary transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
        </div>

        {/* Waveform / Player */}
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-2">
              Creating Your Song
            </h3>
            <p className="text-muted text-sm mb-4">
              This usually takes 1-3 minutes. We&apos;ll refresh automatically.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating with ACE-Step 1.5...
            </div>
          </div>
        ) : (
          <>
            <audio
              ref={audioRef}
              src={song.file_url}
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
              onEnded={() => {
                setPlaying(false)
                setCurrentTime(0)
              }}
              onError={() => setError("Playback failed — file may be missing")}
              preload="metadata"
            />
            <Waveform
              playing={playing}
              currentTime={currentTime}
              duration={duration}
              onTogglePlay={togglePlay}
              loading={audioLoading}
            />
            {song.file_url && (
              <div className="flex items-center gap-4 mt-4 text-sm text-muted">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(duration)}
                </div>
              </div>
            )}
          </>
        )}

        {/* Lyrics */}
        {song.lyrics && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-medium mb-4">Lyrics</h3>
            <pre className="text-sm text-muted leading-relaxed whitespace-pre-wrap font-sans">
              {song.lyrics}
            </pre>
          </div>
        )}

        {/* Story */}
        {song.story && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium mb-2">Original Story</h3>
            <p className="text-sm text-muted leading-relaxed">{song.story}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(sec: number) {
  if (!sec) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}
