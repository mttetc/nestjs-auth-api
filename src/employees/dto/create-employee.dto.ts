import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Prisma, Role } from 'generated/prisma';

export class CreateEmployeeDto
  implements Pick<Prisma.EmployeeCreateInput, 'name' | 'email' | 'role'>
{
  @ApiProperty({
    description: 'Employee full name',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Employee email address',
    example: 'john.doe@company.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Employee role',
    enum: Role,
    example: Role.ENGINEER,
  })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({
    description: 'Associated user ID (optional)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;
}
