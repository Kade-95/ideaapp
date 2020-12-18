import { CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

export class AuthGaurd implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        if (!request.headers.authorization) {
            return false;
        }
        request.user = await this.validateToken(request.headers.authorization);        
        return true;
    }

    async validateToken(authorization: string) {
        const [tag, token] = authorization.split(' ');
        if (tag !== 'Creeper') {
            throw new HttpException("Invalid token", HttpStatus.FORBIDDEN);
        }

        try {
            const decoded = await jwt.verify(token, process.env.SECRET);            
            return decoded;
        } catch (error) {
            const message = `Token error: ${error.message || error.name}`;
            throw new HttpException(message, HttpStatus.FORBIDDEN);
        }
    }
}