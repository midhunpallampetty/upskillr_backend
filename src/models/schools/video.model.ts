import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  videoName: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  isDeleted:{type:Boolean,default:false}
}, { timestamps: true });

export { VideoSchema };
export default mongoose.model('Video', VideoSchema);
