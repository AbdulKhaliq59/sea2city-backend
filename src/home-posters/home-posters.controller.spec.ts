import { Test, TestingModule } from '@nestjs/testing';
import { HomePostersController } from './home-posters.controller';

describe('HomePostersController', () => {
  let controller: HomePostersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomePostersController],
    }).compile();

    controller = module.get<HomePostersController>(HomePostersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
