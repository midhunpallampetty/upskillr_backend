// Updated Student Controller (extract schoolName from req.body; aligned with reference)
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
    this.getStudentById = this.getStudentById.bind(this);
    this.verifyStudentOtp = this.verifyStudentOtp.bind(this);
  }

  // POST /student/verify-otp
  async verifyStudentOtp(req: Request, res: Response): Promise<any> {
    const { schoolName, email, otp } = req.body;

    if (!schoolName) {
      return res.status(400).json({ msg: 'School name is required' });
    }

    try {
      await this.studentService.verifyOtp(schoolName, email, otp);
      return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error: any) {
      console.error('[Verify OTP Error]', error.message);
      return res.status(error.statusCode || 500).json({
        msg: error.message || 'Something went wrong',
      });
    }
  }

  async registerStudent(req: Request<{}, {}, StudentBody & { schoolName: string }>, res: Response, next: NextFunction): Promise<any> {
    const { schoolName, fullName, email, password } = req.body;

    if (!schoolName) {
      return res.status(400).json({ msg: 'School name is required' });
    }

    try {
      const student = await this.studentService.register(schoolName, fullName, email, password);
      return res.status(201).json({ msg: 'Student registered', student });
    } catch (error: any) {
      console.error('[Register Error]', error.message);
      return res.status(error.statusCode || 500).json({
        msg: error.message || 'Something went wrong',
      });
    }
  }

  async loginStudent(req: Request<{}, {}, { schoolName: string; email: string; password: string }>, res: Response): Promise<any> {
    const { schoolName, email, password } = req.body;

    if (!schoolName) {
      return res.status(400).json({ msg: 'School name is required' });
    }

    try {
      const student = await this.studentService.login(schoolName, email, password);
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
    const { schoolName, schoolId } = req.body;
    console.log("School ID in controller:", schoolId);

    if (!schoolName) {
      return res.status(400).json({ msg: 'School name is required' });
    }

    try {
      const students = await this.studentService.listStudents(schoolName, schoolId);
      return res.status(200).json({ students });
    } catch (error: any) {
      console.error('[List Students Error]', error.message);
      return res.status(error.statusCode || 500).json({
        msg: error.message || 'Something went wrong',
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<any> {
    const { schoolName, email } = req.body;

    if (!schoolName) {
      return res.status(400).json({ msg: 'School name is required' });
    }

    try {
      await this.studentService.forgotPassword(schoolName, email);
      return res.status(200).json({ msg: 'Password reset link sent to email' });
    } catch (error: any) {
      console.error('[Forgot Password Error]', error.message);

      return res.status(error.statusCode || 500).json({
        msg: error.message || 'Something went wrong',
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<any> {
    const { schoolName, email, token, newPassword } = req.body;

    if (!schoolName) {
      return res.status(400).json({ msg: 'School name is required' });
    }

    try {
      await this.studentService.resetPassword(schoolName, token, email, newPassword);
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
    const { schoolName, fullName, image, currentPassword, newPassword } = req.body;
    console.log(req.body, 'body');

    if (!schoolName) {
      return res.status(400).json({ msg: 'School name is required' });
    }

    try {
      const updatedStudent = await this.studentService.updateStudentProfile(schoolName, studentId, {
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

  async getStudentById(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const { schoolName } = req.query; // Assuming from query for GET; adjust to req.body if needed

    if (!schoolName) {
      return res.status(400).json({ msg: 'School name is required' });
    }

    try {
      const student = await this.studentService.getStudentById(schoolName as string, id);
      return res.status(200).json({ student });
    } catch (error: any) {
      console.error('[Get Student By ID Error]', error.message);
      return res.status(error.statusCode || 500).json({
        msg: error.message || 'Something went wrong',
      });
    }
  }
}
