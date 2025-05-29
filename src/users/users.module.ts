import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [DatabaseModule],
  exports: [UsersService],
})
export class UsersModule {}
