import { t } from 'i18next';

import { enableSupabaseAuth } from '@/const/auth';
import { UserStore } from '@/store/user';
import { LobeUser } from '@/types/user';

const DEFAULT_USERNAME = 'LobeChat';

const nickName = (s: UserStore) => {
  if (!s.enableAuth()) return t('userPanel.defaultNickname', { ns: 'common' });

  if (s.isSignedIn) return s.user?.fullName || s.user?.username;

  return t('userPanel.anonymousNickName', { ns: 'common' });
};

const username = (s: UserStore) => {
  if (!s.enableAuth()) return DEFAULT_USERNAME;

  if (s.isSignedIn) return s.user?.username;

  return 'anonymous';
};

export const userProfileSelectors = {
  nickName,
  userAvatar: (s: UserStore): string => s.user?.avatar || '',
  userId: (s: UserStore) => s.user?.id,
  userProfile: (s: UserStore): LobeUser | null | undefined => s.user,
  username,
};

const isLogin = (s: UserStore) => {
  if (!s.enableAuth()) return true;

  return s.isSignedIn;
};

export const authSelectors = {
  enabledAuth: (s: UserStore): boolean => s.enableAuth(),
  enabledNextAuth: (s: UserStore): boolean => !!s.enabledNextAuth,
  isLoaded: (s: UserStore) => s.isLoaded,
  isLogin,
  isLoginWithAuth: (s: UserStore) => s.isSignedIn,
  isLoginWithSupabase: (s: UserStore): boolean => (s.isSignedIn && enableSupabaseAuth) || false,
};
