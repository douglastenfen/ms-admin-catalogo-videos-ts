import { IUseCase } from '@core/shared/application/use-case.interface';
import { VideoId } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';

export class DeleteVideoUseCase
  implements IUseCase<DeleteVideoInput, DeleteVideoOutput>
{
  constructor(private videoRepository: IVideoRepository) {}

  async execute(input: DeleteVideoInput): Promise<DeleteVideoOutput> {
    const videoId = new VideoId(input.id);

    await this.videoRepository.delete(videoId);
  }
}

export type DeleteVideoInput = {
  id: string;
};

export type DeleteVideoOutput = void;
