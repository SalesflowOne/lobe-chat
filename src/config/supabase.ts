/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const APP_ID = 'agentops';

export const getSupabaseConfig = () => {
  return createEnv({
    client: {
      NEXT_PUBLIC_ENABLE_SUPABASE_AUTH: z.boolean().optional(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
      NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    },
    server: {
      SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_ENABLE_SUPABASE_AUTH: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
      ),
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
};

export const supabaseEnv = getSupabaseConfig();
