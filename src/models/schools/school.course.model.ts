// models/Course.ts
import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
});

const CourseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  isPreliminaryRequired: { type: Boolean, default: false },
  courseThumbnail: { type: String },
  noOfLessons: { type: Number, required: true },
  fee: { type: Number, required: true },
  sections: [SectionSchema],
  forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum' },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
}, { timestamps: true });

export default CourseSchema;
