import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://opppyurtuurhvouovtpp.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcHB5dXJ0dXVyaHZvdW92dHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDUwMTksImV4cCI6MjEwNTQ4MTAxOX0.77eky1OU1anzWsXvuRcnnnXGJDKtKKkqSMrV_LN4tfo';

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.delete({ name, ...options });
        } catch {}
      },
    },
  });
}
