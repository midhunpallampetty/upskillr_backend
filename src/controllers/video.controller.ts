import { Request, Response } from 'express';
import { VideoService } from '../services/video.service';

export class VideoController {
 private videoService: VideoService;

  constructor(videoService: VideoService) {
    this.videoService = videoService;
  }

  getVideoById = async (req: Request, res: Response):Promise<any> => {
    try {
      const { schoolName, videoId } = req.params;

      const video = await this.videoService.getVideoById(schoolName, videoId);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      return res.status(200).json({
        message: '✅ Video fetched successfully',
        data: video,
      });
    } catch (error) {
      console.error('❌ Error fetching video:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
softDeleteVideo = async (req: Request, res: Response): Promise<any> => {
  try {
    const { schoolName, videoId } = req.params;

    const result = await this.videoService.softDeleteVideo(schoolName, videoId);
    if (!result) {
      return res.status(404).json({ message: '❌ Video not found or already deleted' });
    }

    return res.status(200).json({
      message: '🗑️ Video soft-deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('❌ Error soft-deleting video:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

  getVideosByIds = async (req: Request, res: Response):Promise<any> => {
    try {
      const { schoolName } = req.params;
      const ids = (req.query.ids as string)?.split(',') || [];

      if (!ids.length) {
        return res.status(400).json({ message: '❌ No video IDs provided' });
      }

      const videos = await this.videoService.getVideosByIds(schoolName, ids);
      return res.status(200).json({
        message: '✅ Videos fetched successfully',
        data: videos,
      });
    } catch (error) {
      console.error('❌ Error fetching videos:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
}
