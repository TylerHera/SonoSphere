import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa'; // For fetching Supabase JWKS

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is not configured in environment variables.');
    }
    const audience = configService.get<string>('SUPABASE_JWT_AUDIENCE') || 'authenticated';
    const issuer = configService.get<string>('SUPABASE_JWT_ISSUER') || `${supabaseUrl}/auth/v1`;

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: audience,
      issuer: issuer,
      algorithms: ['RS256'], // Supabase typically uses RS256
    });
  }

  async validate(payload: any) {
    // The payload is the decoded JWT.
    // Supabase JWT payload typically includes: sub (user_id), aud, exp, iat, iss, email, role, etc.
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token: Missing subject (sub).');
    }
    // We can augment the request user object here if needed.
    // By default, Passport attaches the payload to request.user.
    // Return an object that will be set as request.user
    return {
      userId: payload.sub, // This is the Supabase User ID
      email: payload.email,
      app_metadata: payload.app_metadata, // if present
      user_metadata: payload.user_metadata, // if present
      aud: payload.aud,
      role: payload.role, // Standard Supabase role, or could be in app_metadata
    };
  }
}
