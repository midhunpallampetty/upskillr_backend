// src/services/student.service.ts

import { StudentRepository } from '../repositories/student.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { sendEmail } from '../utils/sendEmail';
import crypto from 'crypto';
import { AppError } from '../utils/AppError';
export class StudentService {
  constructor(private readonly studentRepo: StudentRepository) { }

  async register(fullName: string, email: string, password: string) {
    const existing = await this.studentRepo.findByEmail(email);
if (existing) throw new AppError('Student already exists', 409);

    const hashedPassword = await hashPassword(password);
    return await this.studentRepo.createStudent({
      fullName,
      email,
      password: hashedPassword,
    });
  }

  async login(email: string, password: string) {
    const student = await this.studentRepo.findByEmail(email);
    if (!student) throw new AppError('Student not found', 404);

    const isMatch = await comparePassword(password, student.password);
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    return student;
  }

  async listStudents() {
    return this.studentRepo.findAllStudents();
  }

  async forgotPassword(email: string) {
    const student = await this.studentRepo.findByEmail(email);
    if (!student) throw new AppError('Student not found', 404);


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
        <p>This link will expire in 15 minutes.</p>
        <br/>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <p>– Team Upskillr</p>
      `,
    });
  }

  async resetPassword(token: string, email: string, newPassword: string) {
    const student = await this.studentRepo.findByResetToken(email, token);
    if (!student) throw new AppError('Invalid or expired reset token', 400);


    const hashedPassword = await hashPassword(newPassword);
    await this.studentRepo.updatePassword(student._id.toString(), hashedPassword);
  }
async updateStudentProfile(studentId: string, updates: {
  fullName?: string;
  image?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const student = await this.studentRepo.findById(studentId);
  if (!student) throw new AppError('Student not found', 404);

  const updateData: Partial<{ fullName: string; image: string; password: string }> = {};

  if (updates.fullName) updateData.fullName = updates.fullName;
  if (updates.image) updateData.image = updates.image;

  if (updates.newPassword) {
    if (!updates.currentPassword) {
      throw new AppError('Current password is required to change password', 400);
    }

    const isMatch = await comparePassword(updates.currentPassword, student.password);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 401);
    }

    const hashed = await hashPassword(updates.newPassword);
    updateData.password = hashed;
  }

  return await this.studentRepo.updateStudent(studentId, updateData);
}

}

