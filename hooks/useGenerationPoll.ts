"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

export type GenerationStatus = "queued" | "generating" | "completed" | "failed"

export type GenerationPollData = {
  id: string
  status: GenerationStatus
  file_url?: string
  lyrics?: string
  style_tags?: string
  title?: string
  genre?: string
  mood?: string
  tempo?: string
  error_message?: string
}

export function useGenerationPoll(generationId: string, onComplete?: () => void) {
  const router = useRouter()
  const [status, setStatus] = useState<GenerationStatus>("queued")
  const [data, setData] = useState<GenerationPollData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const startTimeRef = useRef(Date.now())
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const triggerRedirect = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    onCompleteRef.current?.()
    setTimeout(() => {
      router.push(`/song/${generationId}`)
    }, 1500)
  }, [generationId, router])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const poll = async () => {
      try {
        const res = await fetch(`/api/generations/${generationId}`)
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          setError(json.error_message || "Failed to check generation status")
          return
        }
        const json = (await res.json()) as GenerationPollData
        setData(json)
        setStatus(json.status)
        if (json.status === "failed") {
          setError(json.error_message || "Generation failed")
          if (interval) clearInterval(interval)
        }
        if (json.status === "completed" && json.file_url) {
          if (interval) clearInterval(interval)
          triggerRedirect()
        }
      } catch {
        setError("Network error while checking status")
      }
    }

    poll()
    interval = setInterval(poll, 5000)

    const tick = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    return () => {
      if (interval) clearInterval(interval)
      clearInterval(tick)
    }
  }, [generationId, triggerRedirect])

  return { status, data, error, elapsedSeconds }
}
