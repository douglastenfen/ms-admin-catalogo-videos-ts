import { Test, TestingModule } from '@nestjs/testing';
import { RabbitmqFakeController } from './rabbitmq-fake.controller';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

describe('RabbitmqFakeController', () => {
  let controller: RabbitmqFakeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RabbitmqFakeController],
      providers: [
        {
          provide: AmqpConnection,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RabbitmqFakeController>(RabbitmqFakeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
