import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { razorpay, PACKS } from "@/lib/razorpay"
import { supabase } from "@/lib/supabase"

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

    // Get or create user
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (pack === "unlimited") {
      // Create subscription
      const planId = process.env.RAZORPAY_UNLIMITED_PLAN_ID
      if (!planId) {
        return NextResponse.json({ error: "Subscription plan not configured" }, { status: 500 })
      }

      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12,
        notes: { user_id: user.id, pack: "unlimited" },
      })

      // Save order
      await supabase.from("orders").insert({
        user_id: user.id,
        razorpay_order_id: subscription.id,
        amount: packConfig.amount,
        currency: "INR",
        pack,
        status: "created",
        type: "subscription",
      })

      return NextResponse.json({ id: subscription.id, type: "subscription" })
    }

    // Create one-time order
    const order = await razorpay.orders.create({
      amount: packConfig.amount,
      currency: "INR",
      receipt: `${user.id}-${Date.now()}`,
      notes: { user_id: user.id, pack },
    })

    // Save order
    await supabase.from("orders").insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount: packConfig.amount,
      currency: "INR",
      pack,
      status: "created",
      type: "one_time",
    })

    return NextResponse.json({ id: order.id, amount: order.amount, type: "one_time" })
  } catch (err) {
    console.error("Create order error:", err)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
