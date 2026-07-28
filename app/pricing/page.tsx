import { PricingCards } from "@/components/PricingCards"
import { Check } from "lucide-react"

const features = [
  "High-quality 60-second songs",
  "Multiple genres and moods",
  "WAV format download",
  "No expiry on credits",
  "Fast generation (1-3 min)",
  "Commercial use allowed",
]

export default function PricingPage() {
  return (
    <div className="min-h-screen px-4 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-2">
          Simple Pricing
        </h1>
        <p className="text-muted">
          Buy credits, use when you want. No subscriptions required.
        </p>
      </div>

      <PricingCards />

      <div className="mt-20">
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-center mb-8">
          Everything included
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted">
              <Check className="w-4 h-4 text-success shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
