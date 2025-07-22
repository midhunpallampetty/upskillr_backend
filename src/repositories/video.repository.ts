import mongoose from 'mongoose';
import { VideoSchema } from '../models/schools/video.model';

export class VideoRepository {
  async getVideoById(schoolName: string, videoId: string) {
    const db = mongoose.connection.useDb(schoolName);
    const Video = db.model('Video', VideoSchema);
console.log(videoId,"videoId");
    return await Video.findOne({ _id: videoId, isDeleted: { $ne: true } });

  }

  async getVideosByIds(schoolName: string, ids: string[]) {
    const db = mongoose.connection.useDb(schoolName);
    const Video = db.model('Video', VideoSchema);

  return await Video.find({ _id: { $in: ids }, isDeleted: { $ne: true } });

  }
  async softDeleteVideo(schoolName: string, videoId: string) {
  const db = mongoose.connection.useDb(schoolName);
  const Video = db.model('Video', VideoSchema);

  const result = await Video.findOneAndUpdate(
    { _id: videoId, isDeleted: { $ne: true } },
    { $set: { isDeleted: true } },
    { new: true }
  );

  return result;
}

}
