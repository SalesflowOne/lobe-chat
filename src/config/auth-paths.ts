/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  AGENTOPS_ALLOWED_HOSTS,
  DEFAULT_APP_HOST,
  agentOpsEnv,
  isAllowedAppHost,
} from '@/config/agentops';

export const getAppOrigin = (): string => {
  const configured = agentOpsEnv.NEXT_PUBLIC_AGENTOPS_APP_URL;
  if (configured) return configured.replace(/\/$/, '');

  return `https://${DEFAULT_APP_HOST}`;
};

export const AUTH_PATHS = {
  forgotPasswordUrl: '/forgot-password',
  profileUrl: '/profile',
  resetPasswordUrl: '/reset-password',
  signInUrl: '/login',
  signUpUrl: '/signup',
} as const;

export const getAgentOpsAuthUrls = () => {
  const origin = getAppOrigin();

  return {
    forgotPasswordUrl: `${origin}${AUTH_PATHS.forgotPasswordUrl}`,
    profileUrl: `${origin}${AUTH_PATHS.profileUrl}`,
    resetPasswordUrl: `${origin}${AUTH_PATHS.resetPasswordUrl}`,
    signInUrl: `${origin}${AUTH_PATHS.signInUrl}`,
    signUpUrl: `${origin}${AUTH_PATHS.signUpUrl}`,
  };
};

export const resolveAppOriginFromRequest = (req: Request): string => {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = (forwardedHost ?? req.headers.get('host') ?? '').split(',')[0].trim();

  if (host && isAllowedAppHost(host)) {
    const protocol = req.headers.get('x-forwarded-proto') ?? 'https';
    return `${protocol}://${host}`;
  }

  return getAppOrigin();
};

export const getAllowedOrigins = (req?: Request): string[] => {
  const origins = new Set<string>(AGENTOPS_ALLOWED_HOSTS.map((host) => `https://${host}`));
  origins.add(getAppOrigin());

  if (req) {
    origins.add(resolveAppOriginFromRequest(req));
  }

  return [...origins];
};
