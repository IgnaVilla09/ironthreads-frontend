import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null | undefined;

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSupabaseBrowserClient() {
  if (supabaseClient !== undefined) {
    return supabaseClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    supabaseClient = null;
    return supabaseClient;
  }

  if (!isValidSupabaseUrl(url)) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL debe ser una URL HTTP/HTTPS valida');
    supabaseClient = null;
    return supabaseClient;
  }

  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
}
