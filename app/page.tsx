import { Sparkles } from "lucide-react"
import Link from "next/link"
import { DemoPlayer } from "@/components/DemoPlayer"
import { HowItWorks } from "@/components/HowItWorks"
import { PricingCards } from "@/components/PricingCards"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 pt-24 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border text-xs text-muted mb-6">
            <Sparkles className="w-3 h-3 text-secondary" />
            AI-Powered Music Generation
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold font-[family-name:var(--font-heading)] leading-tight mb-6">
            Turn Your Story
            <br />
            <span className="gradient-text">Into a Song</span>
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto mb-10">
            Write a moment. Pick a vibe. Get a custom song in under 2 minutes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/create"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl gradient-bg text-white font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-5 h-5" />
              Start Creating
            </Link>
            <Link
              href="#pricing"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-muted hover:text-white hover:border-primary transition-colors"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Demos */}
      <section className="px-4 py-20 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-center mb-10">
          Hear What&apos;s Possible
        </h2>
        <DemoPlayer />
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-center mb-10">
          How It Works
        </h2>
        <HowItWorks />
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-center mb-2">
          Choose Your Pack
        </h2>
        <p className="text-muted text-center mb-10">
          Pay as you go. No hidden fees. No expiry on credits.
        </p>
        <PricingCards />
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} TuneForge. All rights reserved.</p>
      </footer>
    </div>
  )
}
