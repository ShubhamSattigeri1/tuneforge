import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { razorpay, PACKS } from "@/lib/razorpay"
import { getSupabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pack } = await req.json()
    const packConfig = PACKS[pack as keyof typeof PACKS]
    if (!packConfig) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 })
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

    const order = await razorpay.orders.create({
      amount: packConfig.amount,
      currency: "INR",
      receipt: `${user.id.slice(0, 8)}-${Date.now()}`,
      notes: { user_id: user.id, pack },
    })

    const { error: insertError } = await supabaseAdmin.from("orders").insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount: packConfig.amount,
      currency: "INR",
      pack,
      status: "created",
      type: "one_time",
    })

    if (insertError) {
      console.error("Insert order error:", insertError)
      return NextResponse.json(
        { error: `Failed to save order: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: order.id, amount: order.amount })
  } catch (err) {
    console.error("Create order error:", err)
    const anyErr = err as {
      message?: string
      error?: { description?: string }
      statusCode?: number
    }
    return NextResponse.json(
      {
        error:
          anyErr.error?.description ||
          anyErr.message ||
          "Failed to create order",
      },
      { status: 500 }
    )
  }
}