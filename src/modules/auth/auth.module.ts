import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '@/modules/users/users.module';
import { TokenBlacklistService } from '@/modules/auth/token-blacklist.service';
import { RedisModule } from '@/core/redis/redis.module';

import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { JwtStrategy } from '@/modules/auth/jwt.strategy';
import { DatabaseModule } from '@/core/database/database.module';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { TokenBlacklistGuard } from '@/shared/guards/token-blacklist.guard';

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
