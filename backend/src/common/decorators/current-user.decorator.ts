import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../../modules/auth/interfaces/request-user.interface';

// Uso: @CurrentUser() user: RequestUser
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);