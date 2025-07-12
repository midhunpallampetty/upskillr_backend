// services/video.service.ts
import { VideoRepository } from '../repositories/video.repository';

export class VideoService {
  private videoRepository: VideoRepository;

  constructor() {
    this.videoRepository = new VideoRepository();
  }

  getVideoById(schoolName: string, videoId: string) {
    return this.videoRepository.getVideoById(schoolName, videoId);
  }

  getVideosByIds(schoolName: string, ids: string[]) {
    return this.videoRepository.getVideosByIds(schoolName, ids);
  }
}
