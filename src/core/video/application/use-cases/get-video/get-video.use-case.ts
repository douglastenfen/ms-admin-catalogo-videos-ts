import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { VideoOutput, VideoOutputMapper } from '../../common/video.output';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class GetVideoUseCase
  implements IUseCase<GetVideoInput, GetVideoOutput>
{
  constructor(
    private videoRepository: IVideoRepository,
    private categoryRepository: ICategoryRepository,
    private genreRepository: IGenreRepository,
    private castMemberRepository: ICastMemberRepository,
  ) {}

  async execute(input: GetVideoInput): Promise<GetVideoOutput> {
    const videoId = new VideoId(input.id);
    const video = await this.videoRepository.findByID(videoId);

    if (!video) {
      throw new NotFoundError(input.id, Video);
    }

    const genres = await this.genreRepository.findByIds(
      Array.from(video.genresId.values()),
    );

    const categories = await this.categoryRepository.findByIds(
      Array.from(video.categoriesId.values()).concat(
        genres.flatMap((g) => Array.from(g.categoriesId.values())),
      ),
    );

    const castMembers = await this.castMemberRepository.findByIds(
      Array.from(video.castMembersId.values()),
    );

    return VideoOutputMapper.toOutput({
      video,
      genres,
      castMembers,
      allCategoriesOfVideoAndGenre: categories,
    });
  }
}

export type GetVideoInput = {
  id: string;
};

export type GetVideoOutput = VideoOutput;
