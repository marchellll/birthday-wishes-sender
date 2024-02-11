import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleMesssagesTaskService } from './scheduled-messsages-task-service.service';

describe('ScheduleMesssagesTaskService', () => {
  let service: ScheduleMesssagesTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleMesssagesTaskService],
    }).compile();

    service = module.get<ScheduleMesssagesTaskService>(ScheduleMesssagesTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
