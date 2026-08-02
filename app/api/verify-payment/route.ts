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

    if (order) {
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          razorpay_payment_id,
          status: "captured",
        })
        .eq("razorpay_order_id", razorpay_order_id)

      if (updateError) {
        console.error("Update order error:", updateError)
      }
    } else {
      console.warn(
        "Order not found in DB for razorpay_order_id:",
        razorpay_order_id,
        "- falling back to Razorpay API"
      )
    }

    let userId: string | null = order?.user_id ?? null
    let pack: string | null = order?.pack ?? null

    if (!userId || !pack) {
      try {
        const fetchedOrder = await razorpay.orders.fetch(razorpay_order_id)
        const notes = fetchedOrder.notes || {}
        userId = notes.user_id || null
        pack = notes.pack || null
      } catch (fetchErr) {
        console.error("Razorpay order fetch failed:", fetchErr)
      }
    }

    if (!userId || !pack) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (pack === "unlimited") {
      const { error: activateError } = await supabaseAdmin
        .from("users")
        .update({ subscription_active: true })
        .eq("id", userId)

      if (activateError) {
        console.error("Activate unlimited error:", activateError)
        return NextResponse.json(
          { error: `Failed to activate: ${activateError.message}` },
          { status: 500 }
        )
      }
    } else {
      const packConfig = PACKS[pack as keyof typeof PACKS]
      if (packConfig && packConfig.credits) {
        const { error: creditsError } = await supabaseAdmin.rpc("add_credits", {
          p_user_id: userId,
          p_credits: packConfig.credits,
        })

        if (creditsError) {
          console.error("Add credits error:", creditsError)
          return NextResponse.json(
            { error: `Failed to add credits: ${creditsError.message}` },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Verify payment error:", err)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}