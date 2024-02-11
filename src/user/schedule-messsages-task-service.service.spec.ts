import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleMesssagesTaskServiceService } from './schedule-messsages-task-service.service';

describe('ScheduleMesssagesTaskServiceService', () => {
  let service: ScheduleMesssagesTaskServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleMesssagesTaskServiceService],
    }).compile();

    service = module.get<ScheduleMesssagesTaskServiceService>(ScheduleMesssagesTaskServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
