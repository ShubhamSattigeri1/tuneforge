"use client"

import { SessionProvider } from "next-auth/react"
import { CreditsProvider } from "@/context/CreditsContext"
import { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CreditsProvider>
        {children}
      </CreditsProvider>
    </SessionProvider>
  )
}
