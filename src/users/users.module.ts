import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
