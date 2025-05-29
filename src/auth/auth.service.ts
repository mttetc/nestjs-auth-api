import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { Prisma } from 'generated/prisma';
import { UsersService } from '@/users/users.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { User } from 'generated/prisma';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: Prisma.UserCreateInput, response: Response) {
    const existingUser = await this.usersService.findOneByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    const payload = { sub: result.id, email: result.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { user: result, accessToken };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    email: string,
    password: string,
    response: Response,
  ): Promise<LoginResponseDto> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '1h' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async refreshToken(
    token: string,
    response: Response,
  ): Promise<LoginResponseDto> {
    try {
      const decoded = this.jwtService.verify<JwtPayloadDto>(token);
      const user = await this.usersService.findOneByEmail(decoded.email);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const payload = { email: user.email, sub: user.id };
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, { expiresIn: '1h' }),
        this.jwtService.signAsync(payload, { expiresIn: '7d' }),
      ]);

      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // First check if token is blacklisted
      const isBlacklisted =
        await this.tokenBlacklistService.isBlacklisted(token);
      if (isBlacklisted) {
        return false;
      }

      // Verify token is valid
      this.jwtService.verify<JwtPayloadDto>(token);
      return true;
    } catch {
      return false;
    }
  }

  async logout(
    response: Response,
    token: string,
  ): Promise<{ message: string }> {
    try {
      const decoded = this.jwtService.decode<JwtPayloadDto>(token);
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      // Add to blacklist
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      await this.tokenBlacklistService.addToBlacklist(token, expiresIn);

      response.clearCookie('refreshToken');
      return { message: 'Logout successful' };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
