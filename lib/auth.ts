import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { supabase } from "./supabase"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      credits: number
      unlimited: boolean
      unlimited_expiry?: string
    } & DefaultSession["user"]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub

        const { data } = await supabase
          .from("users")
          .select("credits, subscription_active, subscription_end")
          .eq("id", token.sub)
          .single()

        session.user.credits = data?.credits ?? 0
        session.user.unlimited = data?.subscription_active ?? false
        session.user.unlimited_expiry = data?.subscription_end
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await supabase.from("users").upsert(
          { id: user.id, email: user.email, name: user.name, avatar_url: user.image },
          { onConflict: "id" }
        )
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
})
