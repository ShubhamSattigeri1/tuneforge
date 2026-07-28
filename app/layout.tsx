import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { Navbar } from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const poppins = Poppins({ weight: ["600", "700", "800"], subsets: ["latin"], variable: "--font-heading" })

export const metadata: Metadata = {
  title: "TuneForge — Turn Your Story Into a Song",
  description: "AI-powered song generation from your stories. Create custom music in minutes.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${poppins.variable} antialiased bg-background min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
