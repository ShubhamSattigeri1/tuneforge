"use client"

import { useRef, useState } from "react"
import { Share2, Download, Link2, Check, Loader2, Music } from "lucide-react"

type ShareButtonProps = {
  songId: string
  fileUrl?: string
  title?: string
  compact?: boolean
}

export function ShareButton({ songId, fileUrl, title, compact }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cachedCardBlob = useRef<Blob | null>(null)

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/song/${songId}` : ""

  const prefetchCardBlob = async () => {
    try {
      const res = await fetch(`/api/share/${songId}`)
      if (!res.ok) throw new Error("Failed to load card")
      cachedCardBlob.current = await res.blob()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load card")
    }
  }

  const toggleMenu = () => {
    setError(null)
    if (!open) prefetchCardBlob()
    setOpen((v) => !v)
  }

  const shareItem = async (files: File[], text: string) => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ files, title, text })
        return true
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return true
        return false
      }
    }
    return false
  }

  const downloadFile = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleShareCard = async () => {
    setBusy("card")
    setError(null)
    try {
      let blob = cachedCardBlob.current
      if (!blob) {
        const res = await fetch(`/api/share/${songId}`)
        if (!res.ok) throw new Error("Failed to load card")
        blob = await res.blob()
      }
      const file = new File([blob], `tuneforge-${title || songId}.png`, { type: "image/png" })
      const ok = await shareItem([file], `${title || "My song"} — Made with TuneForge`)
      if (!ok) downloadFile(blob, file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      console.error(err)
    } finally {
      setBusy(null)
      setOpen(false)
    }
  }

  const handleShareAudio = async () => {
    if (!fileUrl) return
    setBusy("audio")
    setError(null)
    try {
      const res = await fetch(fileUrl)
      if (!res.ok) throw new Error("Failed to load audio")
      const blob = await res.blob()
      const ext = (fileUrl.split("?")[0].match(/\.(\w+)$/) || [])[1] || "mp3"
      const file = new File([blob], `tuneforge-${title || songId}.${ext}`, { type: blob.type })
      const ok = await shareItem([file], `${title || "My song"} — Made with TuneForge`)
      if (!ok) downloadFile(blob, file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      console.error(err)
    } finally {
      setBusy(null)
      setOpen(false)
    }
  }

  const handleCopyLink = async () => {
    setError(null)
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to copy link")
      console.error(err)
    } finally {
      setBusy(null)
    }
  }

  if (compact) {
    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={toggleMenu}
          className="p-1.5 rounded-lg hover:bg-surface-light text-muted hover:text-white transition-colors"
          aria-label="Share"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
        {open && (
          <Menu
            busy={busy}
            copied={copied}
            error={error}
            hasAudio={!!fileUrl}
            onCard={handleShareCard}
            onAudio={handleShareAudio}
            onCopy={handleCopyLink}
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted hover:text-white hover:border-primary transition-all"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
      {open && (
        <Menu
          busy={busy}
          copied={copied}
          error={error}
          hasAudio={!!fileUrl}
          onCard={handleShareCard}
          onAudio={handleShareAudio}
          onCopy={handleCopyLink}
        />
      )}
    </div>
  )
}

function Menu({
  busy,
  copied,
  error,
  hasAudio,
  onCard,
  onAudio,
  onCopy,
}: {
  busy: string | null
  copied: boolean
  error: string | null
  hasAudio: boolean
  onCard: () => void
  onAudio: () => void
  onCopy: () => void
}) {
  return (
    <div className="absolute left-0 z-50 mt-2 w-56 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden">
      <button
        onClick={onCard}
        disabled={busy !== null}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-surface-light disabled:opacity-50 transition-colors"
      >
        {busy === "card" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        Share card
      </button>
      {hasAudio && (
        <button
          onClick={onAudio}
          disabled={busy !== null}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-surface-light disabled:opacity-50 transition-colors"
        >
          {busy === "audio" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Music className="w-4 h-4" />
          )}
          Share audio
        </button>
      )}
      <button
        onClick={onCopy}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-surface-light transition-colors border-t border-border"
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy link"}
      </button>
      {error && (
        <div className="px-4 py-2 text-xs text-danger border-t border-border">
          {error}
        </div>
      )}
      <div className="px-4 py-2 text-xs text-muted/60 border-t border-border">
        <Download className="inline w-3 h-3 mr-1 -mt-0.5" />
        Desktop auto-downloads
      </div>
    </div>
  )
}
