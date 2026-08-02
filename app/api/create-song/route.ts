import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { story, genre, mood, tempo, vocals } = await req.json()

    if (!story?.trim()) {
      return NextResponse.json({ error: "Story is required" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, credits, subscription_active")
      .eq("email", session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.subscription_active && user.credits < 1) {
      return NextResponse.json({ error: "Not enough credits. Buy more credits in the dashboard." }, { status: 402 })
    }

    if (!user.subscription_active) {
      await supabaseAdmin.rpc("deduct_credit", { p_user_id: user.id })
    }

    const { data: generation, error } = await supabaseAdmin
      .from("generations")
      .insert({
        user_id: user.id,
        story,
        genre,
        mood,
        tempo,
        vocals_mode: vocals,
        status: "queued",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ id: generation.id }, { status: 201 })
  } catch (err) {
    console.error("Create song error:", err)
    return NextResponse.json({ error: "Failed to create song" }, { status: 500 })
  }
}