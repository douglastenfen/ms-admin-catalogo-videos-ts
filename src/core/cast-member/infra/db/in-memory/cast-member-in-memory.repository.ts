import {
  CastMember,
  CastMemberId,
} from '../../../../cast-member/domain/cast-member.aggregate';
import {
  CastMemberFilter,
  ICastMemberRepository,
} from '../../../../cast-member/domain/cast-member.repository';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '../../../../shared/infra/db/in-memory/in-memory.repository';

export class CastMemberInMemoryRepository
  extends InMemorySearchableRepository<
    CastMember,
    CastMemberId,
    CastMemberFilter
  >
  implements ICastMemberRepository
{
  sortableFields: string[] = ['name', 'createdAt'];

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }

  protected async applyFilter(
    items: CastMember[],
    filter: CastMemberFilter | null,
  ): Promise<CastMember[]> {
    if (!filter) {
      return items;
    }

    return items.filter((item) => {
      const containsName =
        filter.name &&
        item.name.toLowerCase().includes(filter.name.toLowerCase());

      const hasType = filter.type && item.type.equals(filter.type);

      return filter.name && filter.type
        ? containsName && hasType
        : filter.name
          ? containsName
          : hasType;
    });
  }

  protected applySort(
    items: CastMember[],
    sort: string | null,
    sortDir: SortDirection | null,
  ): CastMember[] {
    return !sort
      ? super.applySort(items, 'createdAt', 'desc')
      : super.applySort(items, sort, sortDir);
  }
}
