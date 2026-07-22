import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface RequestWithUser {
  user: RequestUser;
}

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return data ? user?.[data as keyof RequestUser] : user;
  },
);
