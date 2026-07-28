import { NextResponse } from "next/server"
import { razorpay, PACKS } from "@/lib/razorpay"
import { supabase } from "@/lib/supabase"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const text = await req.text()
    const signature = req.headers.get("x-razorpay-signature")

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex")

    if (signature !== expectedSign) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(text)

    // Payment captured
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id
      const notes = payment.notes || {}

      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .single()

      if (order && order.status !== "captured") {
        await supabase
          .from("orders")
          .update({
            razorpay_payment_id: payment.id,
            status: "captured",
          })
          .eq("razorpay_order_id", orderId)

        const packConfig = PACKS[order.pack as keyof typeof PACKS]
        if (packConfig && packConfig.credits) {
          await supabase.rpc("add_credits", {
            p_user_id: order.user_id,
            p_credits: packConfig.credits,
          })
        }
      }
    }

    // Subscription charged
    if (event.event === "subscription.charged") {
      const sub = event.payload.subscription.entity
      const notes = sub.notes || {}

      if (notes.pack === "unlimited" && notes.user_id) {
        // Reset monthly limit or extend subscription
        await supabase
          .from("users")
          .update({ subscription_active: true, subscription_end: new Date(Date.now() + 30 * 86400000).toISOString() })
          .eq("id", notes.user_id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}
