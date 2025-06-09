import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { UsersController } from '@/modules/users/users.controller';
import { DatabaseModule } from '@/core/database/database.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
