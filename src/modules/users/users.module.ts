import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '@/modules/database/database.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
