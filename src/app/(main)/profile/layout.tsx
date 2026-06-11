import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { enableSupabaseAuth } from '@/const/auth';

const Layout = ({ children }: PropsWithChildren) => {
  if (!enableSupabaseAuth) return notFound();

  return children;
};

export default Layout;
