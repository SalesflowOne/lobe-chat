'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';

import { enableSupabaseAuth } from '@/const/auth';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const Redirect = memo(() => {
  const router = useRouter();
  const [isLogin, isLoaded, isUserStateInit, isUserHasConversation, isOnboard] = useUserStore(
    (s) => [
      authSelectors.isLogin(s),
      authSelectors.isLoaded(s),
      s.isUserStateInit,
      s.isUserHasConversation,
      s.isOnboard,
    ],
  );

  useEffect(() => {
    if (!isLoaded) return;

    if (!isLogin) {
      router.replace(enableSupabaseAuth ? '/login' : '/welcome');
      return;
    }

    if (!isUserStateInit) return;

    if (!isOnboard) {
      router.replace('/onboard');
      return;
    }

    if (isUserHasConversation) {
      router.replace('/chat');
    } else {
      router.replace('/welcome');
    }
  }, [isUserStateInit, isLoaded, isUserHasConversation, isOnboard, isLogin, router]);

  return null;
});

export default Redirect;
