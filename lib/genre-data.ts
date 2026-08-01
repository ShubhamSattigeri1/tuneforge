export type GenreCard = {
  id: string
  label: string
  emoji: string
  color: string
}

export const GENRE_CARDS: GenreCard[] = [
  { id: "pop", label: "Pop", emoji: "🎵", color: "#ec4899" },
  { id: "rock", label: "Rock", emoji: "🎸", color: "#ef4444" },
  { id: "hiphop", label: "Hip-Hop", emoji: "🎤", color: "#8b5cf6" },
  { id: "electronic", label: "Electronic", emoji: "⚡", color: "#06b6d4" },
  { id: "rnb", label: "R&B", emoji: "🎷", color: "#f97316" },
  { id: "lofi", label: "Lo-fi", emoji: "📻", color: "#84cc16" },
  { id: "jazz", label: "Jazz", emoji: "🎺", color: "#a855f7" },
  { id: "classical", label: "Classical", emoji: "🎻", color: "#64748b" },
  { id: "folk", label: "Folk", emoji: "🪕", color: "#f59e0b" },
  { id: "indie", label: "Indie", emoji: "🎧", color: "#14b8a6" },
]

export const MOOD_CARDS: GenreCard[] = [
  { id: "happy", label: "Happy", emoji: "😊", color: "#fbbf24" },
  { id: "energetic", label: "Energetic", emoji: "🔥", color: "#ef4444" },
  { id: "triumphant", label: "Triumphant", emoji: "🏆", color: "#f59e0b" },
  { id: "romantic", label: "Romantic", emoji: "💕", color: "#ec4899" },
  { id: "dreamy", label: "Dreamy", emoji: "☁️", color: "#a855f7" },
  { id: "melancholic", label: "Melancholic", emoji: "🌧️", color: "#64748b" },
  { id: "calm", label: "Calm", emoji: "🧘", color: "#06b6d4" },
  { id: "dark", label: "Dark", emoji: "🌑", color: "#7c3aed" },
]

export const INSTRUMENT_CARDS: GenreCard[] = [
  { id: "guitar", label: "Guitar", emoji: "🎸", color: "#ef4444" },
  { id: "synth", label: "Synth", emoji: "🎹", color: "#06b6d4" },
  { id: "piano", label: "Piano", emoji: "🎹", color: "#a855f7" },
  { id: "drums", label: "Drums", emoji: "🥁", color: "#f59e0b" },
  { id: "bass", label: "Bass", emoji: "🪕", color: "#84cc16" },
  { id: "strings", label: "Strings", emoji: "🎻", color: "#ec4899" },
  { id: "brass", label: "Brass", emoji: "🎺", color: "#f97316" },
  { id: "vocals", label: "Vocals", emoji: "🎤", color: "#8b5cf6" },
  { id: "percussion", label: "Percussion", emoji: "🪘", color: "#fbbf24" },
  { id: "fx", label: "FX", emoji: "✨", color: "#06b6d4" },
]

export const PRODUCTION_CARDS: GenreCard[] = [
  { id: "lofi", label: "Lo-fi", emoji: "📻", color: "#84cc16" },
  { id: "polished", label: "Polished", emoji: "💎", color: "#22d3ee" },
  { id: "experimental", label: "Experimental", emoji: "🧪", color: "#a855f7" },
  { id: "vintage", label: "Vintage", emoji: "📼", color: "#f59e0b" },
  { id: "modern", label: "Modern", emoji: "🚀", color: "#06b6d4" },
  { id: "ambient", label: "Ambient", emoji: "☁️", color: "#64748b" },
  { id: "gritty", label: "Gritty", emoji: "🪨", color: "#ef4444" },
  { id: "cinematic", label: "Cinematic", emoji: "🎬", color: "#ec4899" },
]
