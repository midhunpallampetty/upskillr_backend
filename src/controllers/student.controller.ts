// src/controllers/student.controller.ts

import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { StudentBody } from '../types/student.body';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const studentService = new StudentService();

export class StudentController {
  async registerStudent(
    req: Request<{}, {}, StudentBody>,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { fullName, email, password } = req.body;
      const student = await studentService.register(fullName, email, password);
      return res.status(201).json({ msg: 'Student registered', student });
    } catch (error) {
      if (error instanceof Error && error.message === 'STUDENT_EXISTS') {
        return res.status(400).json({ msg: 'Student already exists' });
      }
      return res.status(500).json({ msg: 'Error registering student' });
    }
  }

  async loginStudent(
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { email, password } = req.body;
      const student = await studentService.login(email, password);

      const payload = { id: student._id, email: student.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return res.status(200).json({
        msg: 'Student logged in',
        student,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return res.status(404).json({ msg: 'Student not found' });
        }
        if (error.message === 'INVALID_CREDENTIALS') {
          return res.status(400).json({ msg: 'Invalid credentials' });
        }
      }
      return res.status(500).json({ msg: 'Login error' });
    }
  }

  async listStudents(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const students = await studentService.listStudents();
      return res.status(200).json({ students });
    } catch (error) {
      return res.status(500).json({ msg: 'Error fetching students' });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<any> {
    try {
      const { email } = req.body;
      await studentService.forgotPassword(email);
      return res.status(200).json({ msg: 'Password reset link sent to email' });
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Student not found' });
      }
      return res.status(500).json({ msg: 'Failed to send password reset email' });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<any> {
    try {
      const { email, token, newPassword } = req.body;
      await studentService.resetPassword(token, email, newPassword);
      return res.status(200).json({ msg: 'Password reset successful' });
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_OR_EXPIRED_TOKEN') {
        return res.status(400).json({ msg: 'Invalid or expired reset token' });
      }
      return res.status(500).json({ msg: 'Failed to reset password' });
    }
  }
}
