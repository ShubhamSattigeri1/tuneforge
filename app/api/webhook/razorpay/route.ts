import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const text = await req.text()
    const signature = req.headers.get("x-razorpay-signature")
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET

    const expectedSign = crypto
      .createHmac("sha256", webhookSecret!)
      .update(text)
      .digest("hex")

    if (signature !== expectedSign) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(text)
    const supabaseAdmin = getSupabaseAdmin()

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id
      const notes = payment.notes || {}

      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .single()

      if (order && order.status !== "captured") {
        await supabaseAdmin
          .from("orders")
          .update({
            razorpay_payment_id: payment.id,
            status: "captured",
          })
          .eq("razorpay_order_id", orderId)

        if (order.pack === "unlimited") {
          await supabaseAdmin
            .from("users")
            .update({ subscription_active: true })
            .eq("id", order.user_id)
        } else {
          const { PACKS } = await import("@/lib/razorpay")
          const packConfig = PACKS[order.pack as keyof typeof PACKS]
          if (packConfig && packConfig.credits) {
            await supabaseAdmin.rpc("add_credits", {
              p_user_id: order.user_id,
              p_credits: packConfig.credits,
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}