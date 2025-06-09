import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from '@/modules/employees/employees.service';
import { DatabaseService } from '@/core/database/database.service';

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeesService, { provide: DatabaseService, useValue: {} }],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
