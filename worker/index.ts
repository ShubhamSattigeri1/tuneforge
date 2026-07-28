import { createClient } from "@supabase/supabase-js"
import { createHmac } from "crypto"

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!
const HF_SPACE_URL = process.env.HF_SPACE_URL || "https://sattigeri07-music-project.hf.space"
const HF_TOKEN = process.env.HF_TOKEN || ""
const POLL_INTERVAL = 15_000

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface Generation {
  id: string
  user_id: string
  story: string
  genre: string
  mood: string
  tempo: string
  vocals_mode: string
  status: string
}

async function callHfSpace(generation: Generation): Promise<{ file_url?: string; lyrics?: string; error?: string }> {
  try {
    const payload = {
      data: [
        generation.story,
        generation.genre,
        generation.mood,
        generation.tempo,
        generation.vocals_mode,
      ],
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (HF_TOKEN) headers["Authorization"] = `Bearer ${HF_TOKEN}`

    const res = await fetch(`${HF_SPACE_URL}/run/predict`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(300_000), // 5 min timeout
    })

    if (!res.ok) {
      const text = await res.text()
      return { error: `HF API error ${res.status}: ${text}` }
    }

    const result = await res.json()
    const data = result.data || []

    // Expected Gradio output: [file_path, lyrics]
    const fileUrl = data[0] || null
    const lyrics = data[1] || null

    // If file is returned as local path, upload to Supabase storage
    if (fileUrl && typeof fileUrl === "string" && fileUrl.startsWith("http")) {
      return { file_url: fileUrl, lyrics }
    }

    return { file_url: fileUrl, lyrics }
  } catch (err: any) {
    return { error: err.message || "Unknown error" }
  }
}

async function processGeneration(generation: Generation) {
  console.log(`[Worker] Processing generation ${generation.id}...`)

  // Mark as generating
  await supabase
    .from("generations")
    .update({ status: "generating" })
    .eq("id", generation.id)

  const result = await callHfSpace(generation)

  if (result.error) {
    console.error(`[Worker] Generation ${generation.id} failed:`, result.error)

    // Refund credit
    await supabase.rpc("refund_credit", { p_user_id: generation.user_id })

    // Mark as failed
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: result.error,
        updated_at: new Date().toISOString(),
      })
      .eq("id", generation.id)

    return
  }

  // Generate a title from the first line of the story
  const title = generation.story.split("\n")[0].slice(0, 60).trim() || "My Song"

  // Mark as completed
  await supabase
    .from("generations")
    .update({
      status: "completed",
      title,
      file_url: result.file_url || null,
      lyrics: result.lyrics || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", generation.id)

  console.log(`[Worker] Generation ${generation.id} completed.`)
}

async function poll() {
  console.log("[Worker] Polling for queued generations...")

  const { data: generations, error } = await supabase
    .from("generations")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1)

  if (error) {
    console.error("[Worker] Poll error:", error)
    return
  }

  if (!generations || generations.length === 0) {
    return
  }

  await processGeneration(generations[0])
}

// Start polling
console.log(`[Worker] Started. Polling every ${POLL_INTERVAL / 1000}s...`)
setInterval(poll, POLL_INTERVAL)
poll() // immediate first poll
