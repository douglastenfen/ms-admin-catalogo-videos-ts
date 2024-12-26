import { Entity } from '../../../../domain/entity';
import { NotFoundError } from '../../../../domain/errors/not-found.error';
import { Uuid } from '../../../../domain/value-objects/uuid.vo';
import { InMemoryRepository } from '../in-memory.repository';

type StubEntityConstructor = {
  entityID?: Uuid;
  name: string;
};

class StubEntity extends Entity {
  entityId: Uuid;
  name: string;

  constructor(props: StubEntityConstructor) {
    super();

    this.entityId = props.entityID || new Uuid();
    this.name = props.name;
  }

  toJSON() {
    return {
      entityID: this.entityId.id,
      name: this.name,
    };
  }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid> {
  getEntity(): new (...args: any[]) => StubEntity {
    return StubEntity;
  }
}

describe('InMemoryRepository Unit Tests', () => {
  let repo: StubInMemoryRepository;

  beforeEach(() => {
    repo = new StubInMemoryRepository();
  });

  it('should insert a new entity', async () => {
    const entity = new StubEntity({ name: 'Test' });

    await repo.insert(entity);

    expect(repo.items).toHaveLength(1);

    expect(repo.items[0]).toBe(entity);
  });

  it('should bulk insert entities', async () => {
    const entities = [
      new StubEntity({ name: 'Test 1' }),
      new StubEntity({ name: 'Test 2' }),
    ];

    await repo.bulkInsert(entities);

    expect(repo.items).toHaveLength(2);

    expect(repo.items).toEqual(entities);
  });

  it('should return all entities', async () => {
    const entities = [
      new StubEntity({ name: 'Test 1' }),
      new StubEntity({ name: 'Test 2' }),
    ];

    await repo.bulkInsert(entities);

    const result = await repo.findAll();

    expect(result).toEqual(entities);
  });

  it('should throws error on update when entity not found', async () => {
    const entity = new StubEntity({ name: 'Test' });

    await expect(repo.update(entity)).rejects.toThrow(
      new NotFoundError(entity.entityId, StubEntity),
    );
  });

  it('should update an entity', async () => {
    const entity = new StubEntity({ name: 'Test' });

    await repo.insert(entity);

    const entityUpdated = new StubEntity({
      entityID: entity.entityId,
      name: 'Test Updated',
    });

    await repo.update(entityUpdated);

    expect(entityUpdated.toJSON()).toStrictEqual(repo.items[0].toJSON());
  });

  it('should throws error on delete when entity not found', async () => {
    const entityID = new Uuid();

    await expect(repo.delete(entityID)).rejects.toThrow(
      new NotFoundError(entityID.id, StubEntity),
    );

    await expect(
      repo.delete(new Uuid('123e4567-e89b-12d3-a456-426614174000')),
    ).rejects.toThrow(
      new NotFoundError('123e4567-e89b-12d3-a456-426614174000', StubEntity),
    );
  });

  it('should delete an entity', async () => {
    const entity = new StubEntity({ name: 'Test' });

    await repo.insert(entity);

    await repo.delete(entity.entityId);
    expect(repo.items).toHaveLength(0);
  });
});
