import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  videoName: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
}, { timestamps: true });

export { VideoSchema };
export default mongoose.model('Video', VideoSchema);
