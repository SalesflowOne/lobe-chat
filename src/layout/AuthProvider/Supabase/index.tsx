'use client';

import { PropsWithChildren, memo } from 'react';

import UserUpdater from './UserUpdater';

const SupabaseAuthProvider = memo(({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
      <UserUpdater />
    </>
  );
});

export default SupabaseAuthProvider;
