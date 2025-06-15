import { LoggerService } from '@/core/logger/logger.service';
import { CreateEmployeeDto } from '@/modules/employees/dto/create-employee.dto';
import { EmployeeResponseDto } from '@/modules/employees/dto/employee-response.dto';
import { UpdateEmployeeDto } from '@/modules/employees/dto/update-employee.dto';
import { EmployeesService } from '@/modules/employees/employees.service';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { TokenBlacklistGuard } from '@/shared/guards/token-blacklist.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EmployeesQueryDto } from './dto/employee-query.dto';
import { Role } from 'generated/prisma';

@UseGuards(JwtAuthGuard, TokenBlacklistGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}
  private readonly logger = new LoggerService(EmployeesService.name);

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({
    status: 201,
    description: 'Employee successfully created',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({
    name: 'query',
    enum: Role,
    required: false,
    description: 'Filter by employee role',
    type: EmployeesQueryDto,
  })
  @ApiResponse({
    status: 200,
    description: 'List of employees',
    type: [EmployeeResponseDto],
  })
  findAll(@Ip() ip: string, @Query() query: EmployeesQueryDto) {
    this.logger.log(
      `Finding all employees with role ${query.role ? query.role : 'no role'} from ${ip}`,
      `EmployeesController ${ip}`,
    );
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Employee found',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiParam({ name: 'id', description: 'Employee ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Employee successfully updated',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  @ApiParam({ name: 'id', description: 'Employee ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Employee successfully deleted' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}
