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
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from("user_blends")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ blends: data || [] })
  } catch (err) {
    console.error("Fetch blends error:", err)
    return NextResponse.json({ error: "Failed to fetch blends" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { genre, mood, instruments, production, blend_name } = await req.json()

    const supabaseAdmin = getSupabaseAdmin()
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from("user_blends")
      .insert({
        user_id: user.id,
        genre: genre || null,
        mood: mood || null,
        instruments: Array.isArray(instruments) ? instruments : [],
        production: production || null,
        blend_name: blend_name || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    console.error("Save blend error:", err)
    return NextResponse.json({ error: "Failed to save blend" }, { status: 500 })
  }
}
