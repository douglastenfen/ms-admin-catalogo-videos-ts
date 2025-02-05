import { CastMembersIdExistsInDatabaseValidator } from '@core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-id-exists-in-database.validator';
import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-id-exists-in-database.validator';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Rating } from '@core/video/domain/rating.vo';
import { Video } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { CreateVideoInput } from './create-video.input';

export class CreateVideoUseCase
  implements IUseCase<CreateVideoInput, CreateVideoOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepository: IVideoRepository,
    private categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
    private genresIdValidator: GenresIdExistsInDatabaseValidator,
    private castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
  ) {}

  async execute(input: CreateVideoInput): Promise<CreateVideoOutput> {
    const [rating, errorRating] = Rating.create(input.rating).asArray();

    const [eitherCategoriesId, eitherGenresId, eitherCastMembersId] =
      await Promise.all([
        await this.categoriesIdValidator.validate(input.categoriesId),
        await this.genresIdValidator.validate(input.genresId),
        await this.castMembersIdValidator.validate(input.castMembersId),
      ]);

    const [categoriesId, errorsCategoriesId] = eitherCategoriesId.asArray();
    const [genresId, errorsGenresId] = eitherGenresId.asArray();
    const [castMembersId, errorsCastMembersId] = eitherCastMembersId.asArray();

    const video = Video.create({
      ...input,
      rating,
      categoriesId: errorsCategoriesId ? [] : categoriesId,
      genresId: errorsGenresId ? [] : genresId,
      castMembersId: errorsCastMembersId ? [] : castMembersId,
    });

    const notification = video.notification;

    if (errorsCategoriesId) {
      notification.setError(
        errorsCategoriesId.map((error) => error.message),
        'categoriesId',
      );
    }

    if (errorsGenresId) {
      notification.setError(
        errorsGenresId.map((error) => error.message),
        'genresId',
      );
    }

    if (errorsCastMembersId) {
      notification.setError(
        errorsCastMembersId.map((error) => error.message),
        'castMembersId',
      );
    }

    if (errorRating) {
      notification.setError(errorRating.message, 'rating');
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.videoRepository.insert(video);
    });

    return { id: video.videoId.id };
  }
}

export type CreateVideoOutput = { id: string };
