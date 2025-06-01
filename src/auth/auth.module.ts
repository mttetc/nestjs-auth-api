import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { TokenBlacklistService } from './token-blacklist.service';
import { RedisModule } from '../redis/redis.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from 'src/database/database.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenBlacklistGuard } from './guards/token-blacklist.guard';

interface EnvConfig {
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
}

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => UsersModule),
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig>) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRATION');
        return {
          secret,
          signOptions: {
            expiresIn,
            algorithm: 'HS256',
          },
        };
      },
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TokenBlacklistService,
    JwtAuthGuard,
    TokenBlacklistGuard,
  ],
  exports: [AuthService, JwtModule, TokenBlacklistGuard],
})
export class AuthModule {}
