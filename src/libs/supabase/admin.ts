import { createClient } from '@supabase/supabase-js';

import { supabaseEnv } from '@/config/supabase';

/**
 * Service-role client for secure server-side admin operations only.
 * Never import this module from client components.
 */
export const createSupabaseAdminClient = () => {
  const url = supabaseEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = supabaseEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase service role key is required for admin operations.');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
