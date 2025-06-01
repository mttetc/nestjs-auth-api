import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Ip,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { EmployeesService } from './employees.service';
import { LoggerService } from '@/logger/logger.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { TokenBlacklistGuard } from '@/auth/guards/token-blacklist.guard';

@UseGuards(JwtAuthGuard, TokenBlacklistGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}
  private readonly logger = new LoggerService(EmployeesService.name);

  @Post()
  create(@Body() createEmployeeDto: Prisma.EmployeeCreateInput) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  findAll(
    @Ip() ip: string,
    @Query('role') role?: 'INTERN' | 'ENGINEER' | 'ADMIN',
  ) {
    this.logger.log(
      `Finding all employees with role ${role ? role : 'no role'} from ${ip}`,
      `EmployeesController ${ip}`,
    );
    return this.employeesService.findAll(role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: Prisma.EmployeeUpdateInput,
  ) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}
