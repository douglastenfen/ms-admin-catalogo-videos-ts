import { CastMemberOutput } from '@core/cast-member/application/use-cases/common/cast-member-output';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { Transform } from 'class-transformer';
import { CollectionPresenter } from '../shared-module/collection.presenter';
import { ListCastMembersOutput } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';

export class CastMemberPresenter {
  castMemberId: string;
  name: string;
  type: CastMemberTypes;
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: CastMemberOutput) {
    this.castMemberId = output.castMemberId;
    this.name = output.name;
    this.type = output.type;
    this.createdAt = output.createdAt;
  }
}

export class CastMemberCollectionPresenter extends CollectionPresenter {
  data: CastMemberPresenter[];

  constructor(output: ListCastMembersOutput) {
    const { items, ...paginationProps } = output;

    super(paginationProps);

    this.data = items.map((item) => new CastMemberPresenter(item));
  }
}
