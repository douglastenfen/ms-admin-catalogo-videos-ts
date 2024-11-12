import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
  ICastMemberRepository,
} from '@core/cast-member/domain/cast-member.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { literal, Op } from 'sequelize';
import { CastMemberModel } from './cast-member.model';
import { CastMemberModelMapper } from './cast-member.model.mapper';

export class CastMemberSequelizeRepository implements ICastMemberRepository {
  sortableFields: string[] = ['name', 'createdAt'];

  orderBy = {
    mysql: {
      name: (sortDir: SortDirection) => literal(`binary name ${sortDir}`),
    },
  };

  constructor(private castMemberModel: typeof CastMemberModel) {}

  async insert(entity: CastMember): Promise<void> {
    const model = CastMemberModelMapper.toModel(entity);

    await this.castMemberModel.create(model.toJSON());
  }

  async bulkInsert(entities: CastMember[]): Promise<void> {
    const models = entities.map((entity) =>
      CastMemberModelMapper.toModel(entity),
    );

    await this.castMemberModel.bulkCreate(
      models.map((model) => model.toJSON()),
    );
  }

  async findByID(entityId: CastMemberId): Promise<CastMember | null> {
    const model = await this._getById(entityId.id);

    return model ? CastMemberModelMapper.toEntity(model) : null;
  }

  private async _getById(id: string): Promise<CastMemberModel> {
    return await this.castMemberModel.findByPk(id);
  }

  async findAll(): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll();

    return models.map((model) => {
      return CastMemberModelMapper.toEntity(model);
    });
  }

  async update(entity: CastMember): Promise<void> {
    const { id } = entity.castMemberId;

    const [affectedRows] = await this.castMemberModel.update(entity.toJSON(), {
      where: { castMemberId: entity.castMemberId.id },
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async delete(entityId: CastMemberId): Promise<void> {
    const { id } = entityId;

    const affectedRows = await this.castMemberModel.destroy({
      where: { castMemberId: id },
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async search(props: CastMemberSearchParams): Promise<CastMemberSearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;

    const where = {};

    if (props.filter && (props.filter.name || props.filter.type)) {
      if (props.filter.name) {
        where['name'] = { [Op.like]: `%${props.filter.name}%` };
      }

      if (props.filter.type) {
        where['type'] = props.filter.type.type;
      }
    }

    const { rows: models, count } = await this.castMemberModel.findAndCountAll({
      ...(props.filter && {
        where,
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sortDir) }
        : { order: [['createdAt', 'DESC']] }),
      offset,
      limit,
    });

    return new CastMemberSearchResult({
      items: models.map((model) => CastMemberModelMapper.toEntity(model)),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  private formatSort(sort: string, sortDir: SortDirection) {
    const dialect = this.castMemberModel.sequelize.getDialect() as 'mysql';

    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sortDir);
    }
    return [[sort, sortDir]];
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}
