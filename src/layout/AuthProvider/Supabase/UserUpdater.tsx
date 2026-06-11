'use client';

import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { mapSupabaseUserToLobeUser } from '@/libs/auth';
import { createSupabaseBrowserClient } from '@/libs/supabase/client';
import { useUserStore } from '@/store/user';

const UserUpdater = memo(() => {
  const useStoreUpdater = createStoreUpdater(useUserStore);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const sync = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      useUserStore.setState({
        isLoaded: true,
        isSignedIn: Boolean(user),
        user: mapSupabaseUserToLobeUser(user),
      });
    };

    void sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      useUserStore.setState({
        isLoaded: true,
        isSignedIn: Boolean(user),
        user: mapSupabaseUserToLobeUser(user),
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  useStoreUpdater('supabaseSignOut', async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
  });

  return null;
});

export default UserUpdater;
