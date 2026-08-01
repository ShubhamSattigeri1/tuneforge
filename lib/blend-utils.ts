import { GENRE_CARDS, MOOD_CARDS, PRODUCTION_CARDS, INSTRUMENT_CARDS } from "./genre-data"

export type BlendInput = {
  genre: string | null
  mood: string | null
  instruments: string[]
  production: string | null
}

const VIBE_PHRASES: Record<string, string> = {
  happy: "Sunny Disposition",
  energetic: "Full-Throttle Energy",
  triumphant: "Champions Rise",
  romantic: "Heart on Sleeve",
  dreamy: "Cloud Nine",
  melancholic: "Blue Hour",
  calm: "Still Waters",
  dark: "Midnight Hour",
  pop: "Mainstream Pop",
  rock: "Raw Power",
  hiphop: "Street Rhythms",
  electronic: "Neon Circuit",
  rnb: "Smooth Groove",
  lofi: "Chill Backdrop",
  jazz: "Late Night Lounge",
  classical: "Timeless Elegance",
  folk: "Rustic Tales",
  indie: "Indie Spirit",
}

const PRODUCTION_VIBES: Record<string, string> = {
  lofi: "Lo-fi Chill",
  polished: "Studio Polish",
  experimental: "Left-Field",
  vintage: "Retro Tape",
  modern: "Future Sound",
  ambient: "Atmospheric",
  gritty: "Raw Edge",
  cinematic: "Big Screen",
}

const INSTRUMENT_FLAVORS: Record<string, string> = {
  guitar: "String-Led",
  synth: "Synth-Washed",
  piano: "Ivory Keys",
  drums: "Beat-Driven",
  bass: "Deep Bassline",
  strings: "Orchestral",
  brass: "Brass Swells",
  vocals: "Vocal-Forward",
  percussion: "Rhythmic Layers",
  fx: "Textured",
}

export function buildBlendName(blend: BlendInput): string {
  const parts: string[] = []

  const mood = MOOD_CARDS.find((c) => c.id === blend.mood)
  const genre = GENRE_CARDS.find((c) => c.id === blend.genre)
  const production = PRODUCTION_CARDS.find((c) => c.id === blend.production)

  if (blend.instruments.length > 0) {
    const flavor = INSTRUMENT_FLAVORS[blend.instruments[0]]
    if (flavor) parts.push(flavor)
  }

  if (mood) parts.push(VIBE_PHRASES[mood.id] || mood.label)
  else if (genre) parts.push(VIBE_PHRASES[genre.id] || genre.label)

  if (production) parts.push(PRODUCTION_VIBES[production.id] || production.label)

  if (parts.length === 0) return "Untitled Blend"

  return parts.slice(0, 3).join(" × ")
}

export function blendDescription(blend: BlendInput): string {
  const names: string[] = []

  const genre = GENRE_CARDS.find((c) => c.id === blend.genre)
  const mood = MOOD_CARDS.find((c) => c.id === blend.mood)
  const production = PRODUCTION_CARDS.find((c) => c.id === blend.production)

  if (genre) names.push(genre.label)
  if (mood) names.push(mood.label)
  blend.instruments.forEach((id) => {
    const inst = INSTRUMENT_CARDS.find((c) => c.id === id)
    if (inst) names.push(inst.label)
  })
  if (production) names.push(production.label)

  if (names.length === 0) return "Pick cards to start blending!"

  return `${names.join(" + ")} = ${buildBlendName(blend)}`
}
