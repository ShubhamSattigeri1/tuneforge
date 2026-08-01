import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const supabaseAdmin = getSupabaseAdmin()
    const { data: generation, error } = await supabaseAdmin
      .from("generations")
      .select("id, user_id, status, file_url, lyrics, style_tags, title, genre, mood, tempo, error_message")
      .eq("id", id)
      .single()

    if (error || !generation) {
      return NextResponse.json({ status: "failed", error_message: "Not found" }, { status: 404 })
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!user || generation.user_id !== user.id) {
      return NextResponse.json({ status: "failed", error_message: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(generation)
  } catch (err) {
    console.error("Generation poll error:", err)
    return NextResponse.json({ status: "failed", error_message: "Server error" }, { status: 500 })
  }
}
