import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  videoName: { type: String, required: true },
  link: { type: String, required: true },
  description: { type: String },
  length: { type: Number }, // in seconds
}, { timestamps: true });

export default mongoose.model('Video', videoSchema);
