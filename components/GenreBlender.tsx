"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { Shuffle, Save, Copy, Check, Trash2, Loader2, Music } from "lucide-react"
import { GENRE_CARDS, MOOD_CARDS, INSTRUMENT_CARDS, PRODUCTION_CARDS, GenreCard } from "@/lib/genre-data"
import { buildBlendName, blendDescription, BlendInput } from "@/lib/blend-utils"

type SavedBlend = {
  id: string
  genre: string | null
  mood: string | null
  instruments: string[] | null
  production: string | null
  blend_name: string | null
  created_at: string
}

const EMPTY_BLEND: BlendInput = { genre: null, mood: null, instruments: [], production: null }

export function GenreBlender() {
  const [blend, setBlend] = useState<BlendInput>(EMPTY_BLEND)
  const [savedBlends, setSavedBlends] = useState<SavedBlend[]>([])
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    fetchSavedBlends()
  }, [])

  const fetchSavedBlends = useCallback(async () => {
    try {
      const res = await fetch("/api/blends")
      if (res.ok) {
        const json = await res.json()
        setSavedBlends(json.blends || [])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  const currentName = useMemo(() => buildBlendName(blend), [blend])
  const description = useMemo(() => blendDescription(blend), [blend])

  const setSingle = (slot: "genre" | "mood" | "production", value: string) => {
    setBlend((prev) => ({ ...prev, [slot]: prev[slot] === value ? null : value }))
  }

  const toggleInstrument = (value: string) => {
    setBlend((prev) => {
      const has = prev.instruments.includes(value)
      return {
        ...prev,
        instruments: has ? prev.instruments.filter((i) => i !== value) : [...prev.instruments, value],
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const [group, id] = String(active.id).split(":")
    if (group === "instrument") {
      if (!blend.instruments.includes(id)) toggleInstrument(id)
    } else {
      setSingle(group as "genre" | "mood" | "production", id)
    }
  }

  const shuffle = () => {
    const random = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
    const randInstruments = (INSTRUMENT_CARDS.length > 0 ? [random(INSTRUMENT_CARDS)] : []).map((c) => c.id)
    setBlend({
      genre: random(GENRE_CARDS).id,
      mood: random(MOOD_CARDS).id,
      instruments: randInstruments,
      production: random(PRODUCTION_CARDS).id,
    })
  }

  const saveBlend = async () => {
    if (!blend.genre && !blend.mood && blend.instruments.length === 0 && !blend.production) return
    setSaving(true)
    try {
      const res = await fetch("/api/blends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...blend, blend_name: currentName }),
      })
      if (res.ok) {
        await fetchSavedBlends()
      }
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const deleteBlend = async (id: string) => {
    try {
      await fetch(`/api/blends/${id}`, { method: "DELETE" })
      setSavedBlends((prev) => prev.filter((b) => b.id !== id))
    } catch {
    }
  }

  const copyBlend = async () => {
    try {
      await navigator.clipboard.writeText(`${currentName} — ${description}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-secondary" />
          <h3 className="font-bold font-[family-name:var(--font-heading)]">Genre Blender</h3>
          <span className="text-xs text-muted">Craft a vibe while you wait</span>
        </div>
        <button
          onClick={shuffle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs text-muted hover:text-white hover:border-primary transition-all"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Shuffle
        </button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <CardColumn
            title="Genre"
            cards={GENRE_CARDS}
            group="genre"
            selected={blend.genre ? [blend.genre] : []}
            onSelect={(id) => setSingle("genre", id)}
          />
          <CardColumn
            title="Mood"
            cards={MOOD_CARDS}
            group="mood"
            selected={blend.mood ? [blend.mood] : []}
            onSelect={(id) => setSingle("mood", id)}
          />
          <CardColumn
            title="Instruments"
            cards={INSTRUMENT_CARDS}
            group="instrument"
            selected={blend.instruments}
            onSelect={toggleInstrument}
          />
          <CardColumn
            title="Production"
            cards={PRODUCTION_CARDS}
            group="production"
            selected={blend.production ? [blend.production] : []}
            onSelect={(id) => setSingle("production", id)}
          />
        </div>
      </DndContext>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
        <p className="text-xs uppercase tracking-wide text-primary-light mb-1">Your Blend</p>
        <p className="text-sm text-white font-medium">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={saveBlend}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-bg text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Blend
        </button>
        <button
          onClick={copyBlend}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm text-muted hover:text-white hover:border-primary transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {savedBlends.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs uppercase tracking-wide text-muted mb-2">Saved Blends</p>
          <div className="flex flex-wrap gap-2">
            {savedBlends.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border text-xs text-muted"
              >
                {b.blend_name || "Untitled Blend"}
                <button
                  onClick={() => deleteBlend(b.id)}
                  className="text-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type CardColumnProps = {
  title: string
  cards: GenreCard[]
  group: string
  selected: string[]
  onSelect: (id: string) => void
}

function CardColumn({ title, cards, group, selected, onSelect }: CardColumnProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {cards.map((card) => (
          <DraggableCard key={card.id} card={card} group={group} selected={selected.includes(card.id)} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function DraggableCard({ card, group, selected, onSelect }: { card: GenreCard; group: string; selected: boolean; onSelect: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `${group}:${card.id}` })

  return (
    <button
      ref={setNodeRef}
      onClick={() => onSelect(card.id)}
      {...listeners}
      {...attributes}
      style={{ borderColor: selected ? card.color : undefined }}
      className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border transition-all select-none touch-none ${
        selected
          ? "bg-white/10 text-white scale-105"
          : "bg-white/5 border-border text-muted hover:border-primary/40 hover:text-white"
      } ${isDragging ? "opacity-40 rotate-3 scale-110" : ""}`}
    >
      <span>{card.emoji}</span>
      {card.label}
    </button>
  )
}
