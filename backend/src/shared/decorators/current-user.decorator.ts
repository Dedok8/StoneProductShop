import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import type { IAccessTokenPayload } from '@/model/auth/domain';

export const CurrentUser = createParamDecorator(
  (data: keyof IAccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: IAccessTokenPayload }>();

    return data ? request.user[data] : request.user;
  },
);
