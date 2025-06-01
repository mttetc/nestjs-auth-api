import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from 'generated/prisma';
import { LoggerService } from '@/logger/logger.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { TokenBlacklistGuard } from '@/auth/guards/token-blacklist.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new LoggerService(UsersController.name);

  // Public registration endpoint
  @Post()
  register(@Body() createDto: Prisma.UserCreateInput) {
    return this.usersService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @Get()
  findAll(@Ip() ip: string) {
    this.logger.log(`Finding all users from ${ip}`, `UsersController ${ip}`);
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @Get(':id')
  findOneById(@Param('id') id: number, @Ip() ip: string) {
    this.logger.log(`Finding user ${id} from ${ip}`, `UsersController ${ip}`);
    return this.usersService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @Get('email/:email')
  findOneByEmail(@Param('email') email: string, @Ip() ip: string) {
    this.logger.log(
      `Finding user ${email} from ${ip}`,
      `UsersController ${ip}`,
    );
    return this.usersService.findOneByEmail(email);
  }

  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: Prisma.UserUpdateInput,
    @Ip() ip: string,
  ) {
    this.logger.log(`Updating user ${id} from ${ip}`, `UsersController ${ip}`);
    return this.usersService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @Delete(':id')
  remove(@Param('id') id: number, @Ip() ip: string) {
    this.logger.log(`Deleting user ${id} from ${ip}`, `UsersController ${ip}`);
    return this.usersService.remove(id);
  }
}
