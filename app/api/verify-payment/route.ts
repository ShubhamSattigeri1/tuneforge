import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { razorpay, PACKS } from "@/lib/razorpay"
import { getSupabaseAdmin } from "@/lib/supabase"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    const sign = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest("hex")

    if (expectedSign !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .single()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    await supabaseAdmin
      .from("orders")
      .update({
        razorpay_payment_id,
        status: "captured",
      })
      .eq("razorpay_order_id", razorpay_order_id)

    const packConfig = PACKS[order.pack as keyof typeof PACKS]
    if (packConfig && packConfig.credits) {
      await supabaseAdmin.rpc("add_credits", {
        p_user_id: order.user_id,
        p_credits: packConfig.credits,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Verify payment error:", err)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}