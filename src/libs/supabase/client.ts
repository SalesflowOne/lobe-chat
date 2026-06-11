import { createBrowserClient } from '@supabase/ssr';

import { supabaseEnv } from '@/config/supabase';

export const createSupabaseBrowserClient = () => {
  const url = supabaseEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and anon key must be configured for browser auth.');
  }

  return createBrowserClient(url, key);
};
