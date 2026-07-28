import { createClient, SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null
let adminClient: SupabaseClient | null = null

export function getSupabase() {
  if (!client) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
    }

    client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return client
}

export function getSupabaseAdmin() {
  if (!adminClient) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    }

    adminClient = createClient(supabaseUrl, supabaseServiceKey)
  }
  return adminClient
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  },
})