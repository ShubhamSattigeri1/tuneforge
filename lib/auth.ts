import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { getSupabaseAdmin } from "./supabase"
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
      if (session.user && session.user.email) {
        const supabaseAdmin = getSupabaseAdmin()

        const { data } = await supabaseAdmin
          .from("users")
          .select("id, credits, subscription_active, subscription_end")
          .eq("email", session.user.email)
          .single()

        if (data) {
          session.user.id = data.id
          session.user.credits = data.credits ?? 0
          session.user.unlimited = data.subscription_active ?? false
          session.user.unlimited_expiry = data.subscription_end
        }
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const supabaseAdmin = getSupabaseAdmin()

        await supabaseAdmin.from("users").upsert(
          { email: user.email, name: user.name, avatar_url: user.image },
          { onConflict: "email" }
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