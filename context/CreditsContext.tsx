"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession } from "next-auth/react"

type CreditsContextType = {
  credits: number
  unlimited: boolean
  refreshCredits: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextType>({
  credits: 0,
  unlimited: false,
  refreshCredits: async () => {},
})

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [credits, setCredits] = useState(0)
  const [unlimited, setUnlimited] = useState(false)

  const refreshCredits = async () => {
    if (!session?.user?.id) return
    const res = await fetch("/api/user/credits")
    const data = await res.json()
    setCredits(data.credits)
    setUnlimited(data.unlimited)
  }

  useEffect(() => {
    if (session?.user?.id) {
      refreshCredits()
    }
  }, [session])

  return (
    <CreditsContext.Provider value={{ credits, unlimited, refreshCredits }}>
      {children}
    </CreditsContext.Provider>
  )
}

export const useCredits = () => useContext(CreditsContext)
