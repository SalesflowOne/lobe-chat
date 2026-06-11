import { Session, User } from '@auth/core/types';

import { LobeUser } from '@/types/user';

export interface UserAuthState {
  enabledNextAuth?: boolean;
  isLoaded?: boolean;
  isSignedIn?: boolean;
  nextSession?: Session;
  nextUser?: User;
  oAuthSSOProviders?: string[];
  supabaseSignOut?: () => Promise<void>;
  user?: LobeUser;
}

export const initialAuthState: UserAuthState = {};
