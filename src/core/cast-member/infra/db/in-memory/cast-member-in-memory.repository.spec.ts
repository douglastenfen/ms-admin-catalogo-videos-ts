import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberInMemoryRepository } from './cast-member-in-memory.repository';
import { CastMemberType } from '@core/cast-member/domain/cast-member-type.vo';

describe('CategoryInMemoryRepository Unit Tests', () => {
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
  });

  it('should return the CastMember entity', () => {
    const entity = repository.getEntity();
    expect(entity).toBe(CastMember);
  });

  describe('using filters', () => {
    it('should no filter items when filter object is null', async () => {
      const items = [
        CastMember.fake().anActor().build(),
        CastMember.fake().aDirector().build(),
      ];

      const filterSpy = jest.spyOn(items, 'filter' as any);

      const filteredItems = await repository['applyFilter'](items, null);

      expect(filterSpy).not.toHaveBeenCalled();
      expect(filteredItems).toStrictEqual(items);
    });

    it('should filter items using name', async () => {
      const items = [
        CastMember.fake().anActor().withName('test').build(),
        CastMember.fake().aDirector().withName('TEST').build(),
        CastMember.fake().anActor().withName('fake').build(),
      ];

      const filterSpy = jest.spyOn(items, 'filter' as any);

      const filteredItems = await repository['applyFilter'](items, {
        name: 'TEST',
      });

      expect(filterSpy).toHaveBeenCalledTimes(1);
      expect(filteredItems).toStrictEqual([items[0], items[1]]);
    });

    it('should filter items using type', async () => {
      const items = [
        CastMember.fake().anActor().build(),
        CastMember.fake().aDirector().build(),
      ];

      const filterSpy = jest.spyOn(items, 'filter' as any);

      let itemsFiltered = await repository['applyFilter'](items, {
        type: CastMemberType.createActor(),
      });

      expect(filterSpy).toHaveBeenCalledTimes(1);
      expect(itemsFiltered).toStrictEqual([items[0]]);

      itemsFiltered = await repository['applyFilter'](items, {
        type: CastMemberType.createDirector(),
      });

      expect(filterSpy).toHaveBeenCalledTimes(2);
      expect(itemsFiltered).toStrictEqual([items[1]]);
    });

    it('should filter items using type and name', async () => {
      const items = [
        CastMember.fake().anActor().withName('test').build(),
        CastMember.fake().anActor().withName('fake').build(),
        CastMember.fake().aDirector().build(),
        CastMember.fake().aDirector().withName('test fake').build(),
      ];

      const itemsFiltered = await repository['applyFilter'](items, {
        name: 'test',
        type: CastMemberType.createActor(),
      });

      expect(itemsFiltered).toStrictEqual([items[0]]);
    });
  });

  describe('using sort', () => {
    it('should sort by createdAt when sort param is null', () => {
      const items = [
        CastMember.fake()
          .anActor()
          .withName('test')
          .withCreatedAt(new Date())
          .build(),
        CastMember.fake()
          .anActor()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 1))
          .build(),
        CastMember.fake()
          .anActor()
          .withName('fake')
          .withCreatedAt(new Date(new Date().getTime() + 2))
          .build(),
      ];

      const itemsSorted = repository['applySort'](items, null, null);

      expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
    });

    it('sort by name', () => {
      const items = [
        CastMember.fake().anActor().withName('c').build(),
        CastMember.fake().anActor().withName('b').build(),
        CastMember.fake().anActor().withName('a').build(),
      ];

      let itemsSorted = repository['applySort'](items, 'name', 'asc');
      expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

      itemsSorted = repository['applySort'](items, 'name', 'desc');
      expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
    });
  });
});
