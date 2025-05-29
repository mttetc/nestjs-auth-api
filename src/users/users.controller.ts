import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from 'generated/prisma';
import { LoggerService } from '@/logger/logger.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new LoggerService(UsersController.name);

  @Get()
  findAll(@Ip() ip: string) {
    this.logger.log(`Finding all users from ${ip}`, `UsersController ${ip}`);
    return this.usersService.findAll();
  }

  @Get(':id')
  findOneById(@Param('id') id: number, @Ip() ip: string) {
    this.logger.log(`Finding user ${id} from ${ip}`, `UsersController ${ip}`);
    return this.usersService.findOneById(id);
  }

  @Get('email/:email')
  findOneByEmail(@Param('email') email: string, @Ip() ip: string) {
    this.logger.log(
      `Finding user ${email} from ${ip}`,
      `UsersController ${ip}`,
    );
    return this.usersService.findOneByEmail(email);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: Prisma.UserUpdateInput,
    @Ip() ip: string,
  ) {
    this.logger.log(`Updating user ${id} from ${ip}`, `UsersController ${ip}`);
    return this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Ip() ip: string) {
    this.logger.log(`Deleting user ${id} from ${ip}`, `UsersController ${ip}`);
    return this.usersService.remove(id);
  }
}
