import { IsEnum, IsOptional } from 'class-validator';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { UserRole } from 'generated/prisma';

export class UsersQueryDto extends QueryParamsDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
