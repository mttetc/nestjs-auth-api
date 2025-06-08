import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Prisma, Role } from 'generated/prisma';

export class UpdateEmployeeDto implements Prisma.EmployeeUpdateInput {
  @ApiPropertyOptional({
    description: 'Employee full name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Employee email address',
    example: 'john.doe@company.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Employee role',
    enum: Role,
    example: Role.ENGINEER,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Associated user ID (optional)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;
}
