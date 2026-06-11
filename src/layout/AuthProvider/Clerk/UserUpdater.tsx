'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useUserStore } from '@/store/user';
import { LobeUser } from '@/types/user';

// update the user data into the context
const UserUpdater = memo(() => {
  const { isLoaded, user, isSignedIn } = useUser();

  const { session, openUserProfile, signOut, openSignIn } = useClerk();

  const useStoreUpdater = createStoreUpdater(useUserStore);

  const lobeUser = {
    avatar: user?.imageUrl,
    firstName: user?.firstName,
    fullName: user?.fullName,
    id: user?.id,
    latestName: user?.lastName,
    username: user?.username,
  } as LobeUser;

  useStoreUpdater('isLoaded', isLoaded);
  useStoreUpdater('user', lobeUser);
  useStoreUpdater('isSignedIn', isSignedIn);

  useStoreUpdater('clerkUser', user);
  useStoreUpdater('clerkSession', session);
  useStoreUpdater('clerkSignIn', openSignIn);
  useStoreUpdater('clerkOpenUserProfile', openUserProfile);
  useStoreUpdater('clerkSignOut', signOut);

  // If Clerk fails to initialize (domain/key mismatch), avoid an infinite loading screen.
  useEffect(() => {
    if (isLoaded) return;

    const timeout = setTimeout(() => {
      useUserStore.setState({ isLoaded: true, isSignedIn: false });
    }, 8000);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  return null;
});

export default UserUpdater;
