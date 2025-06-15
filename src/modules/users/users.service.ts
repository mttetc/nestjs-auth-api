import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { UsersQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(query: UsersQueryDto) {
    const { role, page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [{ email: { contains: search, mode: 'insensitive' } }],
      }),
      ...(role && { role }),
    };

    const [data, total] = await Promise.all([
      this.databaseService.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.databaseService.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(where: Prisma.UserWhereUniqueInput) {
    return this.databaseService.user.findUnique({ where });
  }

  async create(createDto: Prisma.UserCreateInput) {
    return this.databaseService.user.create({
      data: createDto,
    });
  }

  async update(id: number, updateDto: Prisma.UserUpdateInput) {
    return this.databaseService.user.update({
      where: {
        id,
      },
      data: updateDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.user.delete({
      where: {
        id,
      },
    });
  }
}
