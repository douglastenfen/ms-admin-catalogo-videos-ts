import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-id-exists-in-database.validator';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-id-exists-in-database.validator';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { UpdateVideoInput } from './update-video.input';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Rating } from '@core/video/domain/rating.vo';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

export class UpdateVideoUseCase
  implements IUseCase<UpdateVideoInput, UpdateVideoOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepository: IVideoRepository,
    private categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
    private genresIdValidator: GenresIdExistsInDatabaseValidator,
    private castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
  ) {}

  async execute(input: UpdateVideoInput): Promise<UpdateVideoOutput> {
    const videoId = new VideoId(input.id);
    const video = await this.videoRepository.findByID(videoId);

    if (!video) {
      throw new NotFoundError(input.id, Video);
    }

    input.title && video.changeTitle(input.title);
    input.description && video.changeDescription(input.description);
    input.releasedYear && video.changeReleasedYear(input.releasedYear);
    input.duration && video.changeDuration(input.duration);

    if (input.rating) {
      const [type, errorRating] = Rating.create(input.rating).asArray();

      video.changeRating(type);

      errorRating && video.notification.setError(errorRating.message, 'type');
    }

    if (input.isOpened === true) {
      video.markAsOpened();
    }

    if (input.isOpened === false) {
      video.markAsClosed();
    }

    const notification = video.notification;

    if (input.categoriesId) {
      const [categoriesId, errorsCategoriesId] = (
        await this.categoriesIdValidator.validate(input.categoriesId)
      ).asArray();

      categoriesId && video.syncCategoriesId(categoriesId);

      errorsCategoriesId &&
        notification.setError(
          errorsCategoriesId.map((e) => e.message),
          'categoriesId',
        );
    }

    if (input.genresId) {
      const [genresId, errorsGenresId] = (
        await this.genresIdValidator.validate(input.genresId)
      ).asArray();

      genresId && video.syncGenresId(genresId);

      errorsGenresId &&
        notification.setError(
          errorsGenresId.map((e) => e.message),
          'genresId',
        );
    }

    if (input.castMembersId) {
      const [castMembersId, errorsCastMembersId] = (
        await this.castMembersIdValidator.validate(input.castMembersId)
      ).asArray();

      castMembersId && video.syncCastMembersId(castMembersId);

      errorsCastMembersId &&
        notification.setError(
          errorsCastMembersId.map((e) => e.message),
          'castMembersId',
        );
    }

    if (video.notification.hasErrors()) {
      throw new EntityValidationError(video.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.videoRepository.update(video);
    });

    return { id: video.videoId.id };
  }
}

export type UpdateVideoOutput = { id: string };
