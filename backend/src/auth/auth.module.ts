import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt'; // Unused
import { ConfigModule } from '@nestjs/config'; // Keep ConfigModule if JwtStrategy relies on it being imported here, though usually ConfigModule.forRoot() in AppModule is enough.
// import { ConfigService } from '@nestjs/config'; // Unused
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [ConfigModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [JwtStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
