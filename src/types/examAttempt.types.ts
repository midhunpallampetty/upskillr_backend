// src/types/examAttempt.types.ts
import { Types } from "mongoose";

export type ExamType = "prelims" | "final" | "section";

export interface IExamAttempt {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  examType: ExamType;
  attempts: number;
  status: "passed" | "failed" | "ineligible";
  lastAttemptDate: Date | null;
  ineligibleUntil: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttemptCheckResult {
  allowed: boolean;
  reason: string;
}
