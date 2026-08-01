import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY")!;
const HF_SPACE_URL = Deno.env.get("HF_SPACE_URL")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const MAX_MIGRATIONS = 3;

serve(async () => {
  try {
    await migrateAudio();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

async function migrateAudio() {
  const { data: jobs } = await supabase
    .from("generations")
    .select("id, file_url")
    .like("file_url", "%hf.space%")
    .is("migrated_at", null)
    .order("created_at", { ascending: true })
    .limit(MAX_MIGRATIONS);

  if (!jobs?.length) return;

  for (const job of jobs) {
    try {
      const res = await fetch(job.file_url);
      if (!res.ok) continue;
      
      const buffer = new Uint8Array(await res.arrayBuffer());
      const fileName = `${job.id}.wav`;
      
      const { error: uploadError } = await supabase.storage
        .from("songs")
        .upload(fileName, buffer, { contentType: "audio/wav", upsert: true });
      
      if (uploadError) continue;
      
      const { data: { publicUrl } } = supabase.storage
        .from("songs")
        .getPublicUrl(fileName);
      
      await supabase
        .from("generations")
        .update({ file_url: publicUrl, migrated_at: new Date().toISOString() })
        .eq("id", job.id);
    } catch {}
  }
}