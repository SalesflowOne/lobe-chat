import { createErrorResponse } from '@/app/api/errorResponse';
import { JWTPayload, LOBE_CHAT_AUTH_HEADER, OAUTH_AUTHORIZED, enableSupabaseAuth } from '@/const/auth';
import { AgentRuntime, AgentRuntimeError, ChatCompletionErrorPayload } from '@/libs/agent-runtime';
import { getServerAuthUserId } from '@/server/auth/getServerUser';
import { ChatErrorType } from '@/types/fetch';

import { checkAuthMethod, getJWTPayload } from './utils';

type CreateRuntime = (jwtPayload: JWTPayload) => AgentRuntime;
type RequestOptions = { createRuntime?: CreateRuntime; params: { provider: string } };

export type RequestHandler = (
  req: Request,
  options: RequestOptions & {
    createRuntime?: CreateRuntime;
    jwtPayload: JWTPayload;
  },
) => Promise<Response>;

export const checkAuth =
  (handler: RequestHandler) => async (req: Request, options: RequestOptions) => {
    let jwtPayload: JWTPayload;

    try {
      const authorization = req.headers.get(LOBE_CHAT_AUTH_HEADER);
      const oauthAuthorized = !!req.headers.get(OAUTH_AUTHORIZED);

      if (!authorization) throw AgentRuntimeError.createError(ChatErrorType.Unauthorized);

      let authUserId: string | null = null;

      if (enableSupabaseAuth) {
        authUserId = await getServerAuthUserId();
      }

      jwtPayload = await getJWTPayload(authorization);

      checkAuthMethod({
        accessCode: jwtPayload.accessCode,
        apiKey: jwtPayload.apiKey,
        authUserId,
        nextAuthAuthorized: oauthAuthorized,
      });
    } catch (e) {
      const {
        errorType = ChatErrorType.InternalServerError,
        error: errorContent,
        ...res
      } = e as ChatCompletionErrorPayload;

      const error = errorContent || e;

      return createErrorResponse(errorType, { error, ...res, provider: options.params?.provider });
    }

    return handler(req, { ...options, jwtPayload });
  };
