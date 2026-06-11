/**
 * OneAccess-ready auth types. Global profile fields are shared across apps;
 * app-specific data stays in app tables (users, user_settings, etc.).
 */

export type AppRole = 'admin' | 'member' | 'owner' | 'staff' | 'user';

export interface GlobalProfile {
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  firstName?: string | null;
  id: string;
  lastName?: string | null;
  phone?: string | null;
}

export interface SignUpProfileData {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AppAccessRecord {
  appId: string;
  expiresAt?: string | null;
  grantedAt: string;
  userId: string;
}

export interface UserRoleRecord {
  appId: string;
  role: AppRole;
  userId: string;
}
