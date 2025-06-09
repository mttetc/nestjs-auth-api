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
import { EmployeesService } from './employees.service';
import { LoggerService } from '@/modules/logger/logger.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { TokenBlacklistGuard } from '@/modules/auth/guards/token-blacklist.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';

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
    name: 'role',
    enum: ['INTERN', 'ENGINEER', 'ADMIN'],
    required: false,
    description: 'Filter by employee role',
  })
  @ApiResponse({
    status: 200,
    description: 'List of employees',
    type: [EmployeeResponseDto],
  })
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
