import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Browser/client Supabase client (anon key). Use for read-only or RLS-covered writes.
 */
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Server-side only. Use in API routes for uploads and DB insert (bypasses RLS).
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 */
export function createSupabaseAdmin() {
  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side Supabase admin client")
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
