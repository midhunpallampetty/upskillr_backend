

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
  }

  async registerStudent(req: Request<{}, {}, StudentBody>, res: Response, next: NextFunction): Promise<any> {
    const { fullName, email, password } = req.body;
    const student = await this.studentService.register(fullName, email, password);
    return res.status(201).json({ msg: 'Student registered', student });
  }

  async loginStudent(req: Request<{}, {}, { email: string; password: string }>, res: Response): Promise<any> {
    const { email, password } = req.body;
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
  }

  async listStudents(req: Request, res: Response): Promise<any> {
    const students = await this.studentService.listStudents();
    return res.status(200).json({ students });
  }

  async forgotPassword(req: Request, res: Response): Promise<any> {
    const { email } = req.body;
    await this.studentService.forgotPassword(email);
    return res.status(200).json({ msg: 'Password reset link sent to email' });
  }

  async resetPassword(req: Request, res: Response): Promise<any> {
    const { email, token, newPassword } = req.body;
    await this.studentService.resetPassword(token, email, newPassword);
    return res.status(200).json({ msg: 'Password reset successful' });
  }
}
