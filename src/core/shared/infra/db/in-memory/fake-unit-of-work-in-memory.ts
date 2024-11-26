import { AggregateRoot } from '@core/shared/domain/aggregate-root';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';

export class UnitOfWorkFakeInMemory implements IUnitOfWork {
  constructor() {}

  async start(): Promise<void> {
    return;
  }

  async commit(): Promise<void> {
    return;
  }

  async rollback(): Promise<void> {
    return;
  }

  getTransaction() {
    return;
  }

  do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return workFn(this);
  }
  private aggregateRoots: Set<AggregateRoot> = new Set<AggregateRoot>();
}
