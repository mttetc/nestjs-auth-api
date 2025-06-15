import { IsEnum, IsOptional } from 'class-validator';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { Role } from 'generated/prisma';

export class EmployeesQueryDto extends QueryParamsDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
