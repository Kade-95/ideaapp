import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserSession = createParamDecorator((data: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return data ? req.user[data] : req.user;
});