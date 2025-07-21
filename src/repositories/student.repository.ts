import { Student } from '../models/student.model';

export class StudentRepository {
  async findByEmail(email: string) {
    return await Student.findOne({ email });
  }

  async createStudent(data: { fullName: string; email: string; password: string }) {
    return await Student.create(data);
  }

  async findAllStudents() {
    return await Student.find().select('-password');
  }

  // 🔐 Save reset token and expiry
  async setResetToken(email: string, token: string, expires: Date) {
    return await Student.findOneAndUpdate(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expires },
      { new: true }
    );
  }

  // 🔍 Find user by valid reset token (not expired)
  async findByResetToken(email: string, token: string) {
    return await Student.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
  }

  // 🔁 Update password and clear reset token
  async updatePassword(studentId: string, hashedPassword: string) {
    return await Student.findByIdAndUpdate(
      studentId,
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      },
      { new: true }
    );
  }
}
