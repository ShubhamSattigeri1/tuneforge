import { ImageResponse } from "next/og"
import { auth } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/supabase"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tuneforge-kohl.vercel.app"

const FONTS_DIR = path.join(process.cwd(), "lib", "fonts")

function loadFont(file: string): ArrayBuffer {
  return fs.readFileSync(path.join(FONTS_DIR, file))
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { id } = await context.params

    const supabaseAdmin = getSupabaseAdmin()
    const { data: song, error } = await supabaseAdmin
      .from("generations")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !song) {
      return new Response("Song not found", { status: 404 })
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!user || song.user_id !== user.id) {
      return new Response("Forbidden", { status: 403 })
    }

    const title = song.title || "Untitled Song"
    const genre = song.genre || "Custom"
    const mood = song.mood || "Original"
    const tempo = song.tempo ? `${song.tempo}` : "Custom"

    const fontRegular = loadFont("Poppins-Regular.ttf")
    const fontSemiBold = loadFont("Poppins-SemiBold.ttf")
    const fontBold = loadFont("Poppins-Bold.ttf")
    const fontExtraBold = loadFont("Poppins-ExtraBold.ttf")

    const waveform = buildWaveform()

    return new ImageResponse(
      (
        <div
          style={{
            width: 1080,
            height: 1080,
            background: "#0F0F1A",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 72,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Glow top={-180} left={-140} color="rgba(108,40,210,0.45)" />
          <Glow bottom={-220} right={-160} color="rgba(245,158,11,0.35)" />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 56,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                background: "linear-gradient(135deg,#6C28D2,#F59E0B)",
              }}
            />
            <span
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "4px",
                fontFamily: "Poppins",
              }}
            >
              TUNEFORGE
            </span>
          </div>

          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 1.15,
              marginBottom: 40,
              fontFamily: "Poppins",
              maxWidth: 860,
            }}
          >
            {title}
          </div>

          <div style={{ display: "flex", gap: 20, marginBottom: 64 }}>
            <Chip text={genre} color="rgba(108,40,210,0.25)" textColor="#C4B5FD" />
            <Chip text={mood} color="rgba(245,158,11,0.18)" textColor="#FDE68A" />
            <Chip text={tempo} color="rgba(255,255,255,0.08)" textColor="#E5E7EB" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 72 }}>
            {waveform.map((h, i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: h,
                  borderRadius: 999,
                  background:
                    i % 4 === 0
                      ? "linear-gradient(135deg,#6C28D2,#F59E0B)"
                      : "rgba(255,255,255,0.22)",
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "#A0A0B8",
              fontSize: 30,
              fontFamily: "Poppins",
            }}
          >
            <span style={{ fontSize: 38, color: "#F59E0B" }}>♪</span>
            <span style={{ fontWeight: 600 }}>Made with TuneForge</span>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 44,
              fontSize: 24,
              color: "rgba(160,160,184,0.7)",
              fontFamily: "Poppins",
              fontWeight: 400,
            }}
          >
            {SITE_URL.replace("https://", "").replace(/\/$/, "")}
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
        fonts: [
          { name: "Poppins", data: fontRegular, weight: 400, style: "normal" },
          { name: "Poppins", data: fontSemiBold, weight: 600, style: "normal" },
          { name: "Poppins", data: fontBold, weight: 700, style: "normal" },
          { name: "Poppins", data: fontExtraBold, weight: 800, style: "normal" },
        ],
      }
    )
  } catch (err) {
    console.error("Share card error:", err)
    return new Response("Failed to generate card", { status: 500 })
  }
}

function buildWaveform() {
  const bars = 44
  const result: number[] = []
  const seed = [0.35, 0.55, 0.75, 0.5, 0.9, 0.7, 0.4, 0.6, 0.8, 0.65, 0.45, 0.3, 0.5, 0.75, 0.6, 0.85, 0.55, 0.4, 0.7, 0.9, 0.5, 0.35, 0.6, 0.8, 0.45, 0.65, 0.75, 0.4, 0.55, 0.7, 0.85, 0.6, 0.35, 0.5, 0.75, 0.65, 0.45, 0.8, 0.55, 0.7, 0.4, 0.6, 0.75, 0.5]
  for (let i = 0; i < bars; i++) {
    const v = seed[i % seed.length]
    result.push(28 + v * 120)
  }
  return result
}

function Glow({
  top,
  left,
  right,
  bottom,
  color,
}: {
  top?: number
  left?: number
  right?: number
  bottom?: number
  color: string
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        width: 520,
        height: 520,
        borderRadius: 999,
        background: color,
        filter: "blur(120px)",
      }}
    />
  )
}

function Chip({ text, color, textColor }: { text: string; color: string; textColor: string }) {
  return (
    <div
      style={{
        padding: "16px 30px",
        borderRadius: 999,
        background: color,
        fontSize: 32,
        fontWeight: 600,
        color: textColor,
        fontFamily: "Poppins",
      }}
    >
      {text}
    </div>
  )
}
