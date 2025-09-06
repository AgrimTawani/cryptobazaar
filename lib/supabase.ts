import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client-side Supabase client
export const supabase = createClientComponentClient()

// For server components - create this in the component file
export const createServerSupabaseClient = async () => {
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Admin Supabase client (for server-side operations)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
