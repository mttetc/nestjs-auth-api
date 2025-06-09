import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Employee, Role } from 'generated/prisma';

export class EmployeeResponseDto implements Employee {
  @ApiProperty({
    description: 'Employee ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Employee full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Employee email address',
    example: 'john.doe@company.com',
  })
  email: string;

  @ApiProperty({
    description: 'Employee role',
    enum: Role,
    example: Role.ENGINEER,
  })
  role: Role;

  @ApiPropertyOptional({
    description: 'Associated user ID',
    example: 1,
    nullable: true,
  })
  userId: number | null;

  @ApiProperty({
    description: 'Employee creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
