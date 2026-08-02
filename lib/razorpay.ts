import Razorpay from "razorpay"

let client: Razorpay | null = null

export function getRazorpay() {
  if (!client) {
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET
    if (!key_id || !key_secret) {
      throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set")
    }
    client = new Razorpay({ key_id, key_secret })
  }
  return client
}

export const razorpay = new Proxy({} as Razorpay, {
  get(_, prop) {
    return getRazorpay()[prop as keyof Razorpay]
  },
})

export const PACKS = {
  "1": { amount: 2400, credits: 1, label: "1 Song", price: "₹24" },
  "4": { amount: 19900, credits: 4, label: "4 Songs", price: "₹199" },
  "10": { amount: 49900, credits: 10, label: "10 Songs", price: "₹499" },
  "25": { amount: 124900, credits: 25, label: "25 Songs", price: "₹1,249" },
  "unlimited": { amount: 299900, credits: -1, label: "Unlimited", price: "₹2,999" },
} as const

export type PackType = keyof typeof PACKS
