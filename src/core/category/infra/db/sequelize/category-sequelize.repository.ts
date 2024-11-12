import { SortDirection } from '@core/shared/domain/repository/search-params';
import { literal, Op } from 'sequelize';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { Category } from '../../../domain/category.aggregate';
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '../../../domain/category.repository';
import { CategoryModel } from './category.model';
import { CategoryModelMapper } from './category.model.mapper';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'createdAt'];

  orderBy = {
    mysql: {
      name: (sortDir: SortDirection) => literal(`binary name ${sortDir}`),
    },
  };

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    const model = CategoryModelMapper.toModel(entity);

    await this.categoryModel.create(model.toJSON());
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const models = entities.map((entity) =>
      CategoryModelMapper.toModel(entity),
    );

    await this.categoryModel.bulkCreate(models.map((model) => model.toJSON()));
  }

  async update(entity: Category): Promise<void> {
    const { id } = entity.categoryID;
    const model = await this._getById(id);

    if (!model) {
      throw new NotFoundError(id, this.getEntity());
    }

    const modelToUpdate = CategoryModelMapper.toModel(entity);

    await model.update(modelToUpdate.toJSON(), { where: { categoryID: id } });
  }

  async delete(entityID: Uuid): Promise<void> {
    const { id } = entityID;

    const affectedRows = await this.categoryModel.destroy({
      where: { categoryID: id },
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async findByID(entityID: Uuid): Promise<Category | null> {
    const model = await this._getById(entityID.id);

    return model ? CategoryModelMapper.toEntity(model) : null;
  }

  private async _getById(id: string) {
    return await this.categoryModel.findByPk(id);
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();

    return models.map((model) => {
      return CategoryModelMapper.toEntity(model);
    });
  }

  async search(props: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;

    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && {
        where: {
          name: { [Op.like]: `%${props.filter}%` },
        },
      }),

      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sortDir!) }
        : { order: [['createdAt', 'desc']] }),

      offset,
      limit,
    });

    return new CategorySearchResult({
      items: models.map((model) => CategoryModelMapper.toEntity(model)),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  private formatSort(sort: string, sortDir: SortDirection) {
    const dialect = this.categoryModel.sequelize!.getDialect() as 'mysql';

    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sortDir);
    }
    return [[sort, sortDir]];
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
