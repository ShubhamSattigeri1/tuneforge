"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Music, LogOut, Library, Sparkles } from "lucide-react"
import { useCredits } from "@/context/CreditsContext"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function Navbar() {
  const { data: session } = useSession()
  const { credits, unlimited } = useCredits()
  const [open, setOpen] = useState(false)

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 px-4 md:px-8 h-16 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="gradient-bg rounded-lg p-1.5">
          <Music className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold font-[family-name:var(--font-heading)]">
          Tune<span className="gradient-text">Forge</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            {unlimited ? (
              <span className="hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 text-white font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Unlimited
              </span>
            ) : (
              <span className="hidden md:flex items-center gap-1.5 text-sm text-muted">
                <span className="text-primary-light font-bold">{credits}</span> credits
              </span>
            )}

            <Link
              href="/create"
              className="hidden md:flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Create Song
            </Link>

            <Link
              href="/library"
              className="hidden md:flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
            >
              <Library className="w-4 h-4" />
              Library
            </Link>

            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-light transition-colors"
              >
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-sm font-bold">
                  {session.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </button>

              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-surface shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <p className="text-sm font-medium truncate">{session.user?.name}</p>
                      <p className="text-xs text-muted truncate">{session.user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-light transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/library"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-light transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        My Songs
                      </Link>
                      <Link
                        href="/pricing"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-light transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        Buy Credits
                      </Link>
                    </div>
                    <div className="p-2 border-t border-border">
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-danger rounded-lg hover:bg-surface-light transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm px-5 py-2 rounded-lg gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}
