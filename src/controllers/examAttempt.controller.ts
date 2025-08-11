import { Request, Response } from "express";
import { Types } from "mongoose";
import { ExamAttemptService } from "../services/examAttempt.service";

interface CheckEligibilityBody {
  userId: string;
  courseId: string;
  examType: "prelims" | "final" | "section";
}

interface SubmitExamBody {
  userId: string;
  courseId: string;
  examType: "prelims" | "final" | "section";
  isPassed: boolean;
}

export class ExamAttemptController {
  constructor(private attemptService: ExamAttemptService) {}

  checkEligibility = async (
    req: Request<unknown, unknown, CheckEligibilityBody>,
    res: Response
  ):Promise<any> => {
    try {
      const { userId, courseId, examType } = req.body;

      if (!userId || !courseId || !examType) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ success: false, error: "Invalid userId or courseId format" });
      }

      const validExamTypes = ["prelims", "final", "section"];
      if (!validExamTypes.includes(examType)) {
        return res.status(400).json({ success: false, error: "Invalid examType" });
      }

      const result = await this.attemptService.canAttemptExam(
        new Types.ObjectId(userId),
        new Types.ObjectId(courseId),
        examType
      );

      return res.json({ success: true, data: result });
    } catch (error) {
      console.error("Eligibility check error:", error);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  };

  submitExam = async (
    req: Request<unknown, unknown, SubmitExamBody>,
    res: Response
  ):Promise<any> => {
    try {
      const { userId, courseId, examType, isPassed } = req.body;
console.log(req.body,'bodyyyyyyyyyyyyyyyyyyyyy');
      if (!userId || !courseId || !examType || isPassed === undefined) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ success: false, error: "Invalid userId or courseId format" });
      }

      const validExamTypes = ["prelims", "final", "section"];
      if (!validExamTypes.includes(examType)) {
        return res.status(400).json({ success: false, error: "Invalid examType" });
      }

      const attempt = await this.attemptService.recordExamResult(
        new Types.ObjectId(userId),
        new Types.ObjectId(courseId),
        examType,
        isPassed
      );

      return res.json({
        success: true,
        data: {
          message: isPassed ? "✅ Exam passed" : "📄 Exam recorded",
          attempt: {
            userId: attempt.userId,
            courseId: attempt.courseId,
            examType: attempt.examType,
            attempts: attempt.attempts,
            status: attempt.status,
            lastAttemptDate: attempt.lastAttemptDate,
            ineligibleUntil: attempt.ineligibleUntil,
          },
        },
      });
    } catch (error) {
      console.error("Submit exam error:", error);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  };
}   