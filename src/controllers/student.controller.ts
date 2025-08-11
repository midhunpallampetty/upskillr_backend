import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { StudentBody } from '../types/student.body';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

export class StudentController {
  constructor(private readonly studentService: StudentService) {
    this.registerStudent = this.registerStudent.bind(this);
    this.loginStudent = this.loginStudent.bind(this);
    this.listStudents = this.listStudents.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.updateStudentProfile = this.updateStudentProfile.bind(this);
    this.getStudentById=this.getStudentById.bind(this);
    this.verifyStudentOtp=this.verifyStudentOtp.bind(this);
  }
// POST /student/verify-otp
async verifyStudentOtp(req: Request, res: Response):Promise<any> {
  const { email, otp } = req.body;

  await this.studentService.verifyOtp(email, otp);

  return res.status(200).json({ message: 'OTP verified successfully' });
}

  async registerStudent(req: Request<{}, {}, StudentBody>, res: Response, next: NextFunction): Promise<any> {
    const { fullName, email, password } = req.body;

    try {
      const student = await this.studentService.register(fullName, email, password);
      return res.status(201).json({ msg: 'Student registered', student });
    } catch (error: any) {
      console.error('[Register Error]', error.message);
      return res.status(error.statusCode || 500).json({
        msg: error.message || 'Something went wrong',
      });
    }
  }

  async loginStudent(req: Request<{}, {}, { email: string; password: string }>, res: Response): Promise<any> {
    const { email, password } = req.body;

    try {
      const student = await this.studentService.login(email, password);
      const payload = { id: student._id, email: student.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return res.status(200).json({
        msg: 'Student logged in',
        student,
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      console.error('[Login Error]', error.message);

      if (error.statusCode === 401 || error.statusCode === 404) {
        return res.status(401).json({ msg: 'Invalid email or password' });
      }

      return res.status(error.statusCode || 500).json({
        msg: error.message || 'Something went wrong',
      });
    }
  }

  async listStudents(req: Request, res: Response): Promise<any> {
    try {
      const students = await this.studentService.listStudents();
      return res.status(200).json({ students });
    } catch (error: any) {
      console.error('[List Students Error]', error.message);
      return res.status(error.statusCode || 500).json({
        msg: error.message || 'Something went wrong',
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<any> {
    const { email } = req.body;

    try {
      await this.studentService.forgotPassword(email);
      return res.status(200).json({ msg: 'Password reset link sent to email' });
    } catch (error: any) {
      console.error('[Forgot Password Error]', error.message);

      return res.status(error.statusCode || 500).json({
        msg: error.message || 'Something went wrong',
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<any> {
    const { email, token, newPassword } = req.body;

    try {
      await this.studentService.resetPassword(token, email, newPassword);
      return res.status(200).json({ msg: 'Password reset successful' });
    } catch (error: any) {
      console.error('[Reset Password Error]', error.message);

      return res.status(error.statusCode || 500).json({
        msg: error.message || 'Something went wrong',
      });
    }
  }

  async updateStudentProfile(req: Request, res: Response): Promise<any> {
    const studentId = req.params.id;
    const { fullName, image, currentPassword, newPassword } = req.body;
console.log(req.body,'body')
    try {
      const updatedStudent = await this.studentService.updateStudentProfile(studentId, {
        fullName,
        image,
        currentPassword,
        newPassword,
      });

      return res.status(200).json({ msg: 'Student updated successfully', student: updatedStudent });
    } catch (error: any) {
      console.error('[Update Profile Error]', error.message);

      let msg = 'Update failed';
      if (error.message === 'Incorrect current password') msg = error.message;
      if (error.message === 'Current password is required to change password') msg = error.message;
      if (error.message === 'Student not found') msg = error.message;

      return res.status(error.statusCode || 400).json({ msg });
    }
  }
  // src/controllers/student.controller.ts

async getStudentById(req: Request, res: Response): Promise<any> {
  const { id } = req.params;

  try {
    const student = await this.studentService.getStudentById(id);
    return res.status(200).json({ student });
  } catch (error: any) {
    console.error('[Get Student By ID Error]', error.message);
    return res.status(error.statusCode || 500).json({
      msg: error.message || 'Something went wrong',
    });
  }
}

}
