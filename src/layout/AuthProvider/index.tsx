import { PropsWithChildren } from 'react';

import { authEnv } from '@/config/auth';

import NextAuth from './NextAuth';
import NoAuth from './NoAuth';
import Supabase from './Supabase';

const AuthProvider = ({ children }: PropsWithChildren) => {
  if (authEnv.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH) return <Supabase>{children}</Supabase>;

  if (authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH) return <NextAuth>{children}</NextAuth>;

  return <NoAuth>{children}</NoAuth>;
};

export default AuthProvider;
