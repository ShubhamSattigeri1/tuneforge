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
    const { data: song, error } = await supabaseAdmin
      .from("generations")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!user || song.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(song)
  } catch (err) {
    console.error("Song fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch song" }, { status: 500 })
  }
}