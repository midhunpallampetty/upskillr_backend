import { VideoRepository } from '../repositories/video.repository';

export class VideoService {
  private videoRepository: VideoRepository;

 constructor(videoRepository: VideoRepository) {
    this.videoRepository = videoRepository;
  }

  getVideoById(schoolName: string, videoId: string) {
    return this.videoRepository.getVideoById(schoolName, videoId);
  }
softDeleteVideo(schoolName: string, videoId: string) {
  return this.videoRepository.softDeleteVideo(schoolName, videoId);
}

  getVideosByIds(schoolName: string, ids: string[]) {
    return this.videoRepository.getVideosByIds(schoolName, ids);
  }
}
