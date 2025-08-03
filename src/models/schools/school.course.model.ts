// models/schools/school.course.model.ts
import { Schema } from 'mongoose';
import { ICourse } from './types/ICourse';

export const CourseSchema = new Schema<ICourse>({
  courseName: { type: String, required: true },
  isPreliminaryRequired: { type: Boolean, default: false },
  courseThumbnail: { type: String },
  fee: { type: Number, required: true },
  isDeleted:{type:Boolean,default:false},
  sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  forum: { type: Schema.Types.ObjectId, ref: 'Forum' },
  school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  description:{type:String,default:null},
  preliminaryExam: { type: Schema.Types.ObjectId, ref: 'Exam', default: null },
  finalExam: { type: Schema.Types.ObjectId, ref: 'Exam', default: null }

}, { timestamps: true });
