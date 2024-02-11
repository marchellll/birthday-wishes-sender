import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledMesssagesTaskService } from './scheduled-messsages-task.service';

describe('ScheduledMesssagesTaskService', () => {
  let service: ScheduledMesssagesTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduledMesssagesTaskService],
    }).compile();

    service = module.get<ScheduledMesssagesTaskService>(ScheduledMesssagesTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
