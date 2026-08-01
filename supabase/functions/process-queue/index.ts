import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const HF_SPACE_URL = Deno.env.get("HF_SPACE_URL")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  try {
    await processQueue();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Queue processing error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

async function processQueue() {
  const { data: job, error } = await supabase
    .from("generations")
    .select("*")
    .in("status", ["queued", "generating"])
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error || !job) return;

  if (job.status === "queued") await startGeneration(job);
  else if (job.status === "generating") await pollGeneration(job);
}

async function startGeneration(job: any) {
  const res = await fetch(`${HF_SPACE_URL}/queue/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [job.story, job.genre, job.mood, job.tempo, job.vocals_mode],
      fn_index: 0,
    }),
  });

  const result = await res.json();
  if (result.queue_id) {
    await supabase
      .from("generations")
      .update({ status: "generating", hf_queue_id: result.queue_id })
      .eq("id", job.id);
  }
}

async function pollGeneration(job: any) {
  if (!job.hf_queue_id) return;

  const res = await fetch(`${HF_SPACE_URL}/queue/data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queue_id: job.hf_queue_id }),
  });

  const result = await res.json();
  
  if (result.success && result.data) {
    const [filepath, lyrics, style_tags] = result.data;
    const hfFileUrl = `${HF_SPACE_URL}/file=${encodeURIComponent(filepath)}`;
    
    await supabase
      .from("generations")
      .update({
        status: "completed",
        hf_queue_id: null,
        file_url: hfFileUrl,
        lyrics,
        style_tags: style_tags,
      })
      .eq("id", job.id);
  } else if (result.error) {
    await supabase
      .from("generations")
      .update({ status: "failed", error_message: result.error })
      .eq("id", job.id);
  }
}