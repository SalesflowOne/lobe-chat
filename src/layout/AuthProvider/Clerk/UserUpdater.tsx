'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { memo, useEffect, useState } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useUserStore } from '@/store/user';
import { LobeUser } from '@/types/user';

// update the user data into the context
const CLERK_INIT_TIMEOUT_MS = 3000;

const UserUpdater = memo(() => {
  const { isLoaded, user, isSignedIn } = useUser();
  const [clerkInitTimedOut, setClerkInitTimedOut] = useState(false);

  const { session, openUserProfile, signOut, openSignIn } = useClerk();

  const useStoreUpdater = createStoreUpdater(useUserStore);

  const effectiveLoaded = clerkInitTimedOut || isLoaded;
  const effectiveSignedIn = clerkInitTimedOut ? false : isSignedIn;

  const lobeUser = {
    avatar: user?.imageUrl,
    firstName: user?.firstName,
    fullName: user?.fullName,
    id: user?.id,
    latestName: user?.lastName,
    username: user?.username,
  } as LobeUser;

  useStoreUpdater('isLoaded', effectiveLoaded);
  useStoreUpdater('user', lobeUser);
  useStoreUpdater('isSignedIn', effectiveSignedIn);

  useStoreUpdater('clerkUser', user);
  useStoreUpdater('clerkSession', session);
  useStoreUpdater('clerkSignIn', openSignIn);
  useStoreUpdater('clerkOpenUserProfile', openUserProfile);
  useStoreUpdater('clerkSignOut', signOut);

  // If Clerk fails to initialize (domain/key mismatch), avoid an infinite loading screen.
  useEffect(() => {
    if (isLoaded || clerkInitTimedOut) return;

    const timeout = setTimeout(() => {
      setClerkInitTimedOut(true);
    }, CLERK_INIT_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [clerkInitTimedOut, isLoaded]);

  return null;
});

export default UserUpdater;
