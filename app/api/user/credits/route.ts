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
      .select("credits, subscription_active, subscription_end")
      .eq("email", session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ credits: 0, subscription_active: false })
    }

    const hasActiveSub = user.subscription_active && new Date(user.subscription_end) > new Date()

    return NextResponse.json({
      credits: hasActiveSub ? Infinity : user.credits || 0,
      subscription_active: hasActiveSub,
    })
  } catch (err) {
    console.error("Credits fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }
}