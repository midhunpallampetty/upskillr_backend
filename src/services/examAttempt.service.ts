import { Types } from "mongoose";
import { IExamAttempt, ExamType } from "../models/examAttempt.model";
import { ExamAttemptRepository } from "../repositories/examAttempt.repository";

export class ExamAttemptService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly LOCKOUT_DAYS = 7;

  constructor(private attemptRepo: ExamAttemptRepository) {}

  async canAttemptExam(userId: Types.ObjectId, courseId: Types.ObjectId, examType: ExamType) {
    try {
      const attempt = await this.attemptRepo.findAttempt(userId, courseId, examType);

      if (!attempt) {
        return { eligible: true, attemptsLeft: this.MAX_ATTEMPTS };
      }

      if (attempt.status === "passed") {
        return { eligible: false, reason: "already_passed" };
      }

      if (attempt.ineligibleUntil && attempt.ineligibleUntil > new Date()) {
        const daysRemaining = Math.ceil(
          (attempt.ineligibleUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return { eligible: false, reason: "lockout", daysRemaining };
      }

      if (attempt.attempts >= this.MAX_ATTEMPTS) {
        attempt.status = "ineligible";
        attempt.ineligibleUntil = new Date(Date.now() + this.LOCKOUT_DAYS * 24 * 60 * 60 * 1000);
        await this.attemptRepo.updateAttempt(attempt);
        return { eligible: false, reason: "lockout", daysRemaining: this.LOCKOUT_DAYS };
      }

      return { eligible: true, attemptsLeft: this.MAX_ATTEMPTS - attempt.attempts };
    } catch (error) {
      throw new Error(`Failed to check exam eligibility: ${(error as Error).message}`);
    }
  }

  async recordExamResult(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    examType: ExamType,
    isPassed: boolean
  ): Promise<IExamAttempt> {
    try {
      let attempt = await this.attemptRepo.findAttempt(userId, courseId, examType);

      if (!attempt) {
        attempt = await this.attemptRepo.createAttempt({
          userId,
          courseId,
          examType,
          attempts: 0,
        });
      }

      attempt.attempts += 1;
      attempt.lastAttemptDate = new Date();

      if (isPassed) {
        attempt.status = "passed";
        attempt.ineligibleUntil = null;
      } else {
        attempt.status = "failed";
        if (attempt.attempts >= this.MAX_ATTEMPTS) {
          attempt.status = "ineligible";
          attempt.ineligibleUntil = new Date(Date.now() + this.LOCKOUT_DAYS * 24 * 60 * 60 * 1000);
        }
      }

      return await this.attemptRepo.updateAttempt(attempt);
    } catch (error) {
      throw new Error(`Failed to record exam result: ${(error as Error).message}`);
    }
  }
}