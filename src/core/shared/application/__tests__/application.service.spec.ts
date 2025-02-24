import { DomainEventMediator } from '@core/shared/domain/events/domain-event.mediator';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { UnitOfWorkFakeInMemory } from '@core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import EventEmitter2 from 'eventemitter2';
import { ApplicationService } from '../application.service';
import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { ValueObject } from '@core/shared/domain/value-object';

class StubAggregateRoot extends AggregateRoot {
  get entityId(): ValueObject {
    throw new Error('Method not implemented.');
  }
  toJSON() {
    throw new Error('Method not implemented.');
  }
}

describe('ApplicationService Unit Tests', () => {
  let uow: IUnitOfWork;
  let domainEventMediator: DomainEventMediator;
  let applicationService: ApplicationService;

  beforeEach(() => {
    uow = new UnitOfWorkFakeInMemory();

    const eventEmmiter = new EventEmitter2();
    domainEventMediator = new DomainEventMediator(eventEmmiter);
    applicationService = new ApplicationService(uow, domainEventMediator);
  });

  describe('start', () => {
    it('should start the unit of work', async () => {
      const startSpy = jest.spyOn(uow, 'start');

      await applicationService.start();

      expect(startSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('finish', () => {
    it('should commit the unit of work', async () => {
      const aggregateRoot = new StubAggregateRoot();

      uow.addAggregateRoot(aggregateRoot);

      const publishSpy = jest.spyOn(domainEventMediator, 'publish');
      const commitSpy = jest.spyOn(uow, 'commit');

      await applicationService.finish();

      expect(publishSpy).toHaveBeenCalledWith(aggregateRoot);
      expect(commitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('fail', () => {
    it('should rollback the unit of work', async () => {
      const rollbackSpy = jest.spyOn(uow, 'rollback');

      await applicationService.fail();

      expect(rollbackSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('run', () => {
    it('should start, execute the callback, finish and return the result', async () => {
      const callback = jest.fn().mockResolvedValue('result');

      const startSpy = jest.spyOn(applicationService, 'start');
      const finishSpy = jest.spyOn(applicationService, 'finish');

      const result = await applicationService.run(callback);

      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(finishSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');
    });

    it('should start, rollback and throw the error', async () => {
      const callback = jest.fn().mockRejectedValue(new Error('error'));

      const startSpy = jest.spyOn(applicationService, 'start');
      const failSpy = jest.spyOn(applicationService, 'fail');

      await expect(applicationService.run(callback)).rejects.toThrow('error');

      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(failSpy).toHaveBeenCalledTimes(1);
    });
  });
});
