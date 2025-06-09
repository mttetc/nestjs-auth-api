import { Module, forwardRef } from '@nestjs/common';
import { EmployeesService } from '@/modules/employees/employees.service';
import { EmployeesController } from '@/modules/employees/employees.controller';
import { DatabaseModule } from '@/core/database/database.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
