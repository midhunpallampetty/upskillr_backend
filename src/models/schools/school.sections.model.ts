// models/schools/section.model.ts
import { Schema } from 'mongoose';

export const SectionSchema = new Schema({
  sectionName: { type: String, required: true },
  // examRequired: { type: Boolean, default: false },
  videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  exam: { type: Schema.Types.ObjectId, ref: 'Exam' },
  isDeleted:{type:Boolean,default:false},
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true });
