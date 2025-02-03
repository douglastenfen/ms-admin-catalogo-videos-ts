import { InvalidArgumentError } from '@core/shared/domain/errors/invalid-argument.error';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import {
  IVideoRepository,
  VideoSearchParams,
  VideoSearchResult,
} from '@core/video/domain/video.repository';
import { literal, Op } from 'sequelize';
import { VideoModel } from './video.model';
import { VideoModelMapper } from './video.model.mapper';

export class VideoSequelizeRepository implements IVideoRepository {
  sortableFields: string[] = ['name', 'createdAt'];

  orderBy = {
    mysql: {
      name: (sortDir: SortDirection) =>
        `binary ${this.videoModel.name} ${sortDir}`,
    },
  };

  relationsInclude = [
    'categoriesId',
    'genresId',
    'castMembersId',
    'imageMedias',
    'audioVideoMedias',
  ];

  constructor(
    private videoModel: typeof VideoModel,
    private uow: UnitOfWorkSequelize,
  ) {}

  async search(props: VideoSearchParams): Promise<VideoSearchResult> {
    const offSet = (props.page - 1) * props.perPage;
    const limit = props.perPage;

    const videoTableName = this.videoModel.getTableName();

    const videoCategoryRelation =
      this.videoModel.associations.categoriesId.target;
    const videoCategoryTableName = videoCategoryRelation.getTableName();

    const videoGenreRelation = this.videoModel.associations.genresId.target;
    const videoGenreTableName = videoGenreRelation.getTableName();

    const videoCastMemberRelation =
      this.videoModel.associations.castMembersId.target;
    const videoCastMemeberTableName = videoCastMemberRelation.getTableName();

    const videoAlias = this.videoModel.name;

    const wheres: any[] = [];

    if (
      props.filter &&
      (props.filter.title ||
        props.filter.categoriesId ||
        props.filter.genresId ||
        props.filter.castMembersId)
    ) {
      if (props.filter.title) {
        wheres.push({
          field: 'title',
          value: `%${props.filter.title}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${videoAlias}.title LIKE :title`,
        });
      }

      if (props.filter.categoriesId) {
        wheres.push({
          field: 'categories_id',
          value: props.filter.categoriesId.map((c) => c.id),
          get condition() {
            return {
              ['$categoriesId.category_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoCategoryTableName}.category_id IN (:categories_id)`,
        });
      }

      if (props.filter.genresId) {
        wheres.push({
          field: 'genres_id',
          value: props.filter.genresId.map((g) => g.id),
          get condition() {
            return {
              ['$genresId.genre_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoGenreTableName}.genre_id IN (:genres_id)`,
        });
      }

      if (props.filter.castMembersId) {
        wheres.push({
          field: 'cast_members_id',
          value: props.filter.castMembersId.map((c) => c.id),
          get condition() {
            return {
              ['$castMembersId.cast_member_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoCastMemeberTableName}.cast_member_id IN (:cast_members_id)`,
        });
      }
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? this.formatSort(props.sort, props.sortDir)
        : `${videoAlias}.\`created_at\` DESC`;

    const count = await this.videoModel.count({
      distinct: true,
      include: [
        props.filter?.categoriesId && 'categoriesId',
        props.filter?.genresId && 'genresId',
        props.filter?.castMembersId && 'castMembersId',
      ].filter((i) => i) as string[],
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
      transaction: this.uow.getTransaction(),
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    const query = [
      'SELECT',
      `DISTINCT ${videoAlias}.\`video_id\`,${columnOrder} FROM ${videoTableName} as ${videoAlias}`,
      props.filter?.categoriesId
        ? `INNER JOIN ${videoCategoryTableName} ON ${videoAlias}.\`video_id\` = ${videoCategoryTableName}.\`category_id\``
        : '',
      props.filter?.genresId
        ? `INNER JOIN ${videoGenreTableName} ON ${videoAlias}.\`video_id\` = ${videoGenreTableName}.\`genre_id\``
        : '',
      props.filter?.castMembersId
        ? `INNER JOIN ${videoGenreTableName} ON ${videoAlias}.\`video_id\` = ${videoGenreTableName}.\`cast_member_id\``
        : '',
      wheres.length
        ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}`
        : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offSet}`,
    ];

    const [idsResult] = await this.videoModel.sequelize!.query(
      query.join(' '),
      {
        replacements: wheres.reduce(
          (acc, w) => ({ ...acc, [w.field]: w.value }),
          {},
        ),
        transaction: this.uow.getTransaction(),
      },
    );

    const models = await this.videoModel.findAll({
      where: {
        videoId: {
          [Op.in]: idsResult.map(
            (id: { video_id: string }) => id.video_id,
          ) as string[],
        },
      },
      include: this.relationsInclude,
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    });

    return new VideoSearchResult({
      items: models.map((m) => VideoModelMapper.toEntity(m)),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  async insert(entity: Video): Promise<void> {
    await this.videoModel.create(VideoModelMapper.toModelProps(entity), {
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
  }

  async bulkInsert(entities: Video[]): Promise<void> {
    const models = entities.map((e) => VideoModelMapper.toModelProps(e));

    await this.videoModel.bulkCreate(models, {
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
  }

  async update(entity: Video): Promise<void> {
    const model = await this._get(entity.videoId.id);

    if (!model) {
      throw new NotFoundError(entity.videoId.id, this.getEntity());
    }

    await Promise.all([
      ...model.imageMedias.map((i) =>
        i.destroy({ transaction: this.uow.getTransaction() }),
      ),
      ...model.audioVideoMedias.map((a) =>
        a.destroy({ transaction: this.uow.getTransaction() }),
      ),
      model.$remove(
        'categories',
        model.categoriesId.map((c) => c.categoryId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$remove(
        'genres',
        model.genresId.map((g) => g.genreId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$remove(
        'castMembers',
        model.castMembersId.map((c) => c.castMemberId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
    ]);

    const {
      categoriesId,
      genresId,
      castMembersId,
      imageMedias,
      audioVideoMedias,
      ...props
    } = VideoModelMapper.toModelProps(entity);

    await this.videoModel.update(props, {
      where: { videoId: entity.videoId.id },
      transaction: this.uow.getTransaction(),
    });

    await Promise.all([
      ...imageMedias.map((i) =>
        model.$create('imageMedia', i.toJSON(), {
          transaction: this.uow.getTransaction(),
        }),
      ),
      ...audioVideoMedias.map((a) =>
        model.$create('audioVideoMedia', a.toJSON(), {
          transaction: this.uow.getTransaction(),
        }),
      ),
      model.$add(
        'categories',
        categoriesId.map((c) => c.categoryId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$add(
        'genres',
        genresId.map((g) => g.genreId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$add(
        'castMembers',
        castMembersId.map((c) => c.castMemberId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
    ]);
  }

  async delete(entityID: VideoId): Promise<void> {
    const videoCategoryRelation =
      this.videoModel.associations.categoriesId.target;
    const videoGenreRelation = this.videoModel.associations.genresId.target;
    const videoCastMemberRelation =
      this.videoModel.associations.castMembersId.target;
    const imageMediaModel = this.videoModel.associations.imageMedias.target;
    const audioVideoMediaModel =
      this.videoModel.associations.audioVideoMedias.target;

    await Promise.all([
      videoCategoryRelation.destroy({
        where: { videoId: entityID.id },
        transaction: this.uow.getTransaction(),
      }),
      videoGenreRelation.destroy({
        where: { videoId: entityID.id },
        transaction: this.uow.getTransaction(),
      }),
      videoCastMemberRelation.destroy({
        where: { videoId: entityID.id },
        transaction: this.uow.getTransaction(),
      }),
      imageMediaModel.destroy({
        where: { videoId: entityID.id },
        transaction: this.uow.getTransaction(),
      }),
      audioVideoMediaModel.destroy({
        where: { videoId: entityID.id },
        transaction: this.uow.getTransaction(),
      }),
    ]);

    const affecterdRows = await this.videoModel.destroy({
      where: { videoId: entityID.id },
      transaction: this.uow.getTransaction(),
    });

    if (affecterdRows !== 1) {
      throw new NotFoundError(entityID.id, this.getEntity());
    }
  }

  async findByID(entityID: VideoId): Promise<Video | null> {
    const model = await this._get(entityID.id);

    return model ? VideoModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Video[]> {
    const models = await this.videoModel.findAll({
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });

    return models.map((m) => VideoModelMapper.toEntity(m));
  }

  async findByIds(ids: VideoId[]): Promise<Video[]> {
    const models = await this.videoModel.findAll({
      where: {
        videoId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });

    return models.map((m) => VideoModelMapper.toEntity(m));
  }

  async existsById(
    ids: VideoId[],
  ): Promise<{ exists: VideoId[]; notExists: VideoId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existisVideoModels = await this.videoModel.findAll({
      attributes: ['videoId'],
      where: {
        videoId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });

    const existisVideoIds = existisVideoModels.map(
      (m) => new VideoId(m.videoId),
    );

    const notExistsVideoIds = ids.filter(
      (id) => !existisVideoIds.some((e) => e.equals(id)),
    );

    return {
      exists: existisVideoIds,
      notExists: notExistsVideoIds,
    };
  }

  getEntity(): new (...args: any[]) => Video {
    return Video;
  }

  private async _get(id: string): Promise<VideoModel | null> {
    return this.videoModel.findByPk(id, {
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
  }

  private formatSort(sort: string, sortDir: SortDirection | null) {
    const dialect = this.videoModel.sequelize!.getDialect();

    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sortDir);
    }

    return `${this.videoModel.name}.\`${sort}\` ${sortDir}`;
  }
}
