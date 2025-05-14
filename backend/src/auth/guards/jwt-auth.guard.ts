import { Injectable } from '@nestjs/common';
// import { ExecutionContext, UnauthorizedException } from '@nestjs/common'; // Unused
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Optional: You can override handleRequest to customize error handling or logging
  // handleRequest(err, user, info, context: ExecutionContext) {
  //   if (err || !user) {
  //     // Log the error or info for debugging
  //     // console.error('JWT Auth Error:', err, 'Info:', info);
  //     throw err || new UnauthorizedException();
  //   }
  //   return user;
  // }
}
