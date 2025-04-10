import { Test, TestingModule } from '@nestjs/testing';
import { HomePostersService } from './home-posters.service';

describe('HomePostersService', () => {
  let service: HomePostersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomePostersService],
    }).compile();

    service = module.get<HomePostersService>(HomePostersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
