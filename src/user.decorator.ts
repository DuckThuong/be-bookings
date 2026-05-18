import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDecoratorDtoResponse } from './dtos/user/user.dto';

export const User = createParamDecorator(
  (
    data: keyof UserDecoratorDtoResponse | undefined,
    ctx: ExecutionContext,
  ): UserDecoratorDtoResponse | string | number | Date | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserDecoratorDtoResponse;

    if (!data) {
      return user;
    }

    return user[data] as string | number | Date | undefined;
  },
);
