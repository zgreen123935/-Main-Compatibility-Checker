import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// For client-side usage (React components)
export const createClientComponentClient = () => {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// For server-side usage (API routes, Server Actions)
export const createServerComponentClient = () => {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
    },
  })
}
