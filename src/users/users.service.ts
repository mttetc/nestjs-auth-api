import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return this.databaseService.user.findMany();
  }

  async findOneById(id: number) {
    return this.databaseService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findOneByEmail(email: string) {
    return this.databaseService.user.findUnique({
      where: {
        email,
      },
    });
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
