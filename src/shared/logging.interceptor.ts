import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>) {
        const req = context.switchToHttp().getRequest();
        const url = req.url;
        const method = req.method;
        const now = Date.now();
        const res = context.switchToHttp().getResponse();

        res.on('finish', ()=>{
            Logger.log(`${method} ${url} ${Date.now() - now}ms`, context.getClass().name);
        });

        return next.handle();
    }
}