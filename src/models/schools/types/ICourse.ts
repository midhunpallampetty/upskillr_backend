import mongoose, { Model,Schema } from 'mongoose';
import { Types } from 'mongoose';

export interface ICourse {
  courseName: string;
  isPreliminaryRequired?: boolean;
  courseThumbnail?: string;
  noOfLessons: number;
  fee: number;
  sections: Types.ObjectId[]; 
  forum?: Types.ObjectId;
  school: Types.ObjectId;
  preliminaryExam:Types.ObjectId;
  finalExam:Types.ObjectId;
  isDeleted:boolean;
  description:string;
}
