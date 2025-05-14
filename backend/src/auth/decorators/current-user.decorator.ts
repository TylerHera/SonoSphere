import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// This interface should match the object returned by JwtStrategy.validate()
export interface AuthenticatedUser {
  userId: string;
  email?: string;
  role?: string;
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    if (!user) {
      return null; // Or throw an error if user should always be present post-guard
    }
    return data ? user[data] : user;
  },
);
