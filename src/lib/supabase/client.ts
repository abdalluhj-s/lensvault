import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://opppyurtuurhvouovtpp.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcHB5dXJ0dXVyaHZvdW92dHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDUwMTksImV4cCI6MjEwNTQ4MTAxOX0.77eky1OU1anzWsXvuRcnnnXGJDKtKKkqSMrV_LN4tfo';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
