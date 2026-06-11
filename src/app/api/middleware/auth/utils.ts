import { importJWK, jwtVerify } from 'jose';

import { getAppConfig } from '@/config/app';
import {
  JWTPayload,
  JWT_SECRET_KEY,
  NON_HTTP_PREFIX,
  enableNextAuth,
  enableSupabaseAuth,
} from '@/const/auth';
import { AgentRuntimeError } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';

export const getJWTPayload = async (token: string): Promise<JWTPayload> => {
  if (token.startsWith(NON_HTTP_PREFIX)) {
    const jwtParts = token.split('.');
    const payload = jwtParts[1];
    return JSON.parse(atob(payload));
  }

  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.digest('SHA-256', encoder.encode(JWT_SECRET_KEY));

  const jwkSecretKey = await importJWK(
    { k: Buffer.from(secretKey).toString('base64'), kty: 'oct' },
    'HS256',
  );

  const { payload } = await jwtVerify(token, jwkSecretKey);

  return payload as JWTPayload;
};

interface CheckAuthParams {
  accessCode?: string;
  apiKey?: string;
  authUserId?: string | null;
  nextAuthAuthorized?: boolean;
}

export const checkAuthMethod = ({
  apiKey,
  nextAuthAuthorized,
  accessCode,
  authUserId,
}: CheckAuthParams) => {
  if (enableSupabaseAuth) {
    if (!authUserId) throw AgentRuntimeError.createError(ChatErrorType.InvalidClerkUser);
    return;
  }

  if (enableNextAuth && nextAuthAuthorized) return;

  if (apiKey) return;

  const { ACCESS_CODES } = getAppConfig();

  if (!ACCESS_CODES.length) return;

  if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
    console.warn('tracked an invalid access code, 检查到输入的错误密码：', accessCode);
    throw AgentRuntimeError.createError(ChatErrorType.InvalidAccessCode);
  }
};
