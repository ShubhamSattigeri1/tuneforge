import { Edit3, Wand2, Download } from "lucide-react"

const steps = [
  {
    icon: Edit3,
    title: "Tell Your Story",
    description: "Write about a moment, memory, or idea in your own words.",
  },
  {
    icon: Wand2,
    title: "AI Crafts Your Song",
    description: "We analyze your story and generate a unique song in minutes.",
  },
  {
    icon: Download,
    title: "Download & Share",
    description: "Get a high-quality WAV file ready to play anywhere.",
  },
]

export function HowItWorks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {steps.map((step, i) => (
        <div key={i} className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
            <step.icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-2">
            {step.title}
          </h3>
          <p className="text-muted text-sm">{step.description}</p>
        </div>
      ))}
    </div>
  )
}
