import { Module, forwardRef } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DatabaseModule } from '@/modules/database/database.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
