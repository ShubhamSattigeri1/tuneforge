import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const { id } = await context.params
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: song, error } = await supabase
      .from("generations")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    // Verify ownership
    const { data: user } = await supabase
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
