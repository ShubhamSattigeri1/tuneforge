"use client"

import { PACKS } from "@/lib/razorpay"
import { Sparkles, Check } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function PricingCards() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleBuy = async (pack: string) => {
    if (!session) {
      router.push("/login")
      return
    }

    setLoading(pack)

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      })
      const data = await res.json()

      if (data.type === "subscription") {
        window.open(`https://rzp.io/i/${data.id}`, "_blank")
      } else {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: data.id,
          name: "TuneForge",
          description: `${PACKS[pack as keyof typeof PACKS].label}`,
          handler: async function (response: any) {
            await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            })
            router.refresh()
          },
          prefill: { email: session.user?.email },
          theme: { color: "#6C28D2" },
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Object.entries(PACKS).map(([key, pack]) => {
        const isUnlimited = key === "unlimited"
        const isLoading = loading === key

        return (
          <div
            key={key}
            className={`relative rounded-2xl border ${
              isUnlimited
                ? "border-secondary bg-gradient-to-b from-surface to-surface/50"
                : "border-border bg-surface"
            } p-6 flex flex-col`}
          >
            {isUnlimited && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-bg text-xs font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Best Value
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">
                {pack.label}
              </h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">{pack.price}</span>
                {!isUnlimited && (
                  <span className="text-sm text-muted ml-1">
                    (₹{(pack.amount / 100 / pack.credits).toFixed(0)}/song)
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2 mb-6">
              {isUnlimited ? (
                <>
                  <Feature text="Unlimited songs" />
                  <Feature text="Priority generation" />
                  <Feature text="Commercial license" />
                  <Feature text="MP3 + WAV download" />
                </>
              ) : (
                <>
                  <Feature text={`${pack.credits} songs`} />
                  <Feature text="WAV download" />
                  <Feature text="No expiry" />
                </>
              )}
            </div>

            <button
              onClick={() => handleBuy(key)}
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
                isUnlimited
                  ? "gradient-bg text-white hover:opacity-90"
                  : "border border-border text-muted hover:border-primary hover:text-white"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Processing..." : isUnlimited ? "Subscribe" : "Buy Now"}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <Check className="w-4 h-4 text-success shrink-0" />
      {text}
    </div>
  )
}
