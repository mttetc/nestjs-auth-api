import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from '@/modules/employees/employees.controller';
import { EmployeesService } from '@/modules/employees/employees.service';
import { LoggerService } from '@/core/logger/logger.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: EmployeesService, useValue: {} },
        { provide: LoggerService, useValue: {} },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
