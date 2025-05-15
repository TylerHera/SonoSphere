export interface AuthenticatedUser {
    userId: string;
    email?: string;
    role?: string;
    app_metadata?: any;
    user_metadata?: any;
    aud?: string;
}
export declare const CurrentUser: (...dataOrPipes: (keyof AuthenticatedUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
