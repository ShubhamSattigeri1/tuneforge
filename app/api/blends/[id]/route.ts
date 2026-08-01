import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const supabaseAdmin = getSupabaseAdmin()
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: blend } = await supabaseAdmin
      .from("user_blends")
      .select("id, user_id")
      .eq("id", id)
      .single()

    if (!blend || blend.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabaseAdmin.from("user_blends").delete().eq("id", id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete blend error:", err)
    return NextResponse.json({ error: "Failed to delete blend" }, { status: 500 })
  }
}
