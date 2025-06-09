import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '@/modules/users/users.controller';
import { UsersService } from '@/modules/users/users.service';
import { LoggerService } from '@/core/logger/logger.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: {} },
        { provide: LoggerService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
