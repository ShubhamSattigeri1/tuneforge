import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!user) {
      return NextResponse.json([])
    }

    const { data: songs, error } = await supabaseAdmin
      .from("generations")
      .select("id, title, story, genre, mood, status, created_at, file_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(songs || [])
  } catch (err) {
    console.error("Songs fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 })
  }
}