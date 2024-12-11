import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import {
  GenreSearchParams,
  GenreSearchResult,
  IGenreRepository,
} from '@core/genre/domain/genre.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { literal, Op } from 'sequelize';
import { GenreModel } from './genre.model';
import { GenreModelMapper } from './genre.model.mapper';
import { InvalidArgumentError } from '@core/shared/domain/errors/invalid-argument.error';

export class GenreSequelizeRepository implements IGenreRepository {
  sortableFields: string[] = ['name', 'createdAt'];

  orderBy = {
    mysql: {
      name: (sortDir: SortDirection) =>
        `binary ${this.genreModel.name}.name ${sortDir}`,
    },
  };

  constructor(
    private genreModel: typeof GenreModel,
    private uow: UnitOfWorkSequelize,
  ) {}

  async insert(entity: Genre): Promise<void> {
    await this.genreModel.create(GenreModelMapper.toModelProps(entity), {
      include: ['categoriesId'],
      transaction: this.uow.getTransaction(),
    });
  }

  async bulkInsert(entities: Genre[]): Promise<void> {
    const models = entities.map((entity) =>
      GenreModelMapper.toModelProps(entity),
    );

    await this.genreModel.bulkCreate(models, {
      include: ['categoriesId'],
      transaction: this.uow.getTransaction(),
    });
  }

  async findByID(entityID: GenreId): Promise<Genre | null> {
    const model = await this._getById(entityID.id);

    return model ? GenreModelMapper.toEntity(model) : null;
  }

  private async _getById(id: string): Promise<GenreModel | null> {
    return this.genreModel.findByPk(id, {
      include: ['categoriesId'],
      transaction: this.uow.getTransaction(),
    });
  }

  async findAll(): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      include: ['categoriesId'],
      transaction: this.uow.getTransaction(),
    });

    return models.map((model) => {
      return GenreModelMapper.toEntity(model);
    });
  }

  async findByIds(ids: GenreId[]): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      where: { genreId: ids.map((id) => id.id) },
      include: ['categoriesId'],
      transaction: this.uow.getTransaction(),
    });

    return models.map((model) => GenreModelMapper.toEntity(model));
  }

  async existsById(
    ids: GenreId[],
  ): Promise<{ exists: GenreId[]; notExists: GenreId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsGenreModels = await this.genreModel.findAll({
      attributes: ['genreId'],
      where: {
        genreId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });

    const existsGenreIds = existsGenreModels.map(
      (model) => new GenreId(model.genreId),
    );

    const notExistsGenreIds = ids.filter(
      (id) => !existsGenreIds.some((genreId) => genreId.equals(id)),
    );

    return {
      exists: existsGenreIds,
      notExists: notExistsGenreIds,
    };
  }

  async update(aggregate: Genre): Promise<void> {
    const model = await this._getById(aggregate.genreId.id);

    if (!model) {
      throw new NotFoundError(aggregate.genreId.id, this.getEntity());
    }

    await model.$remove(
      'categories',
      model.categoriesId.map((category) => category.categoryId),
      { transaction: this.uow.getTransaction() },
    );

    const { categoriesId, ...props } = GenreModelMapper.toModelProps(aggregate);

    await this.genreModel.update(props, {
      where: { genreId: aggregate.genreId.id },
      transaction: this.uow.getTransaction(),
    });

    await model.$add(
      'categories',
      categoriesId.map((category) => category.categoryId),
      { transaction: this.uow.getTransaction() },
    );
  }

  async delete(entityID: GenreId): Promise<void> {
    const genreCategoryAssociation =
      this.genreModel.associations.categoriesId.target;

    await genreCategoryAssociation.destroy({
      where: { genreId: entityID.id },
      transaction: this.uow.getTransaction(),
    });

    const affectedRows = await this.genreModel.destroy({
      where: { genreId: entityID.id },
      transaction: this.uow.getTransaction(),
    });

    if (affectedRows !== 1)
      throw new NotFoundError(entityID.id, this.getEntity());
  }

  async search(props: GenreSearchParams): Promise<GenreSearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;

    const genreCategoryAssociation =
      this.genreModel.associations.categoriesId.target;

    const genreTableName = this.genreModel.getTableName();
    const genreCategoryTableName = genreCategoryAssociation.getTableName();
    const genreAlias = this.genreModel.name;

    const options: any[] = [];

    if (props.filter && (props.filter.name || props.filter.categoriesId)) {
      if (props.filter.name) {
        options.push({
          field: 'name',
          value: `%${props.filter.name}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${genreAlias}.name like :name`,
        });
      }

      if (props.filter.categoriesId) {
        options.push({
          field: 'categories_id',
          value: props.filter.categoriesId.map((category) => category.id),
          get condition() {
            return {
              ['$categoriesId.category_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${genreCategoryTableName}.category_id in (:categories_id)`,
        });
      }
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? this.formatSort(props.sort, props.sortDir!)
        : `${genreAlias}.\`created_at\` DESC`;

    // @ts-expect-error - count is a number
    const count: number = await this.genreModel.count({
      distinct: true,
      // @ts-expect-error - add include only if categoriesId is present
      include: [props.filter?.categoriesId && 'categoriesId'].filter((i) => i),
      where: options.length
        ? { [Op.and]: options.map((o) => o.condition) }
        : {},
      transaction: this.uow.getTransaction(),
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    const query = [
      'SELECT',
      `DISTINCT ${genreAlias}.\`genre_id\`, ${columnOrder} FROM ${genreTableName} as ${genreAlias}`,
      props.filter?.categoriesId
        ? `INNER JOIN ${genreCategoryTableName} ON ${genreAlias}.\`genre_id\` = ${genreCategoryTableName}.\`genre_id\``
        : '',
      options.length
        ? `WHERE ${options.map((o) => o.rawCondition).join(' AND ')}`
        : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    const [idsResult] = await this.genreModel.sequelize!.query(
      query.join(' '),
      {
        replacements: options.reduce(
          (acc, o) => ({ ...acc, [o.field]: o.value }),
          {},
        ),
        transaction: this.uow.getTransaction(),
      },
    );

    const models = await this.genreModel.findAll({
      where: {
        genreId: {
          [Op.in]: idsResult.map((id: any) => id.genre_id) as string[],
        },
      },
      include: ['categoriesId'],
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    });

    return new GenreSearchResult({
      items: models.map((model) => GenreModelMapper.toEntity(model)),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  private formatSort(sort: string, sortDir: SortDirection) {
    const dialect = this.genreModel.sequelize!.getDialect();

    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sortDir);
    }

    return `${this.genreModel.name}.\`${sort}\` ${sortDir}`;
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }
}
