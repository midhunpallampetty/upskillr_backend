// src/services/student.service.ts

import { StudentRepository } from '../repositories/student.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { sendEmail } from '../utils/sendEmail';
import crypto from 'crypto';

export class StudentService {
  private studentRepo = new StudentRepository();

  async register(fullName: string, email: string, password: string) {
    const existing = await this.studentRepo.findByEmail(email);
    if (existing) {
      throw new Error('STUDENT_EXISTS');
    }

    const hashedPassword = await hashPassword(password);
    const student = await this.studentRepo.createStudent({
      fullName,
      email,
      password: hashedPassword,
    });

    return student;
  }

  async login(email: string, password: string) {
    const student = await this.studentRepo.findByEmail(email);
    if (!student) throw new Error('NOT_FOUND');

    const isMatch = await comparePassword(password, student.password);
    if (!isMatch) throw new Error('INVALID_CREDENTIALS');

    return student;
  }

  async listStudents() {
    return await this.studentRepo.findAllStudents();
  }

  // 🔐 Send forgot password email
  async forgotPassword(email: string) {
    const student = await this.studentRepo.findByEmail(email);
    if (!student) throw new Error('NOT_FOUND');

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 mins
    await this.studentRepo.setResetToken(email, token, expires);

  const resetLink = `http://localhost:5173/student/reset-password?token=${token}&email=${email}`;
 
  await sendEmail({
    to: email,
    subject: 'Reset Your Password – Upskillr',
    html: `
      <h3>Hello ${student.fullName},</h3>
      <p>We received a request to reset your password.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link will expire in 1 hour.</p>
      <br/>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <p>– Team Upskillr</p>
    `,
  });
  
  }

  async resetPassword(token: string, email: string, newPassword: string) {
    const student = await this.studentRepo.findByResetToken(email, token);
    if (!student) throw new Error('INVALID_OR_EXPIRED_TOKEN');

    const hashedPassword = await hashPassword(newPassword);
    await this.studentRepo.updatePassword(student._id.toString(), hashedPassword);
  }
}
