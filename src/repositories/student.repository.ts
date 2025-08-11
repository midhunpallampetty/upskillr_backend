import { Student } from '../models/student.model';

export class StudentRepository {
  async findByEmail(email: string) {
    return await Student.findOne({ email });
  }

async deleteUnverifiedExpiredStudents() {
  const now = new Date();
  return await Student.deleteMany({
    isVerified: false,
    otpExpires: { $lt: now },
  });
}

  async createStudent(data: {
  fullName: string;
  email: string;
  password: string;
  otp?: string;
  otpExpires?: Date;
}) {
  return await Student.create(data);
}
async verifyOtp(email: string, otp: string) {
  const student = await Student.findOne({
    email,
    otp,
    otpExpires: { $gt: new Date() },
  });

  if (!student) return null;

  student.isVerified = true;
  student.otp = undefined;
  student.otpExpires = undefined;
  await student.save();

  return student;
}
async resendOtp(email: string, otp: string, otpExpires: Date) {
  return await Student.findOneAndUpdate(
    { email },
    { otp, otpExpires },
    { new: true }
  );
}

async updateStudent(studentId: string, updates: Partial<{ fullName: string; image: string; password: string }>) {
  return await Student.findByIdAndUpdate(studentId, updates, { new: true }).select('-password');
}

async findById(studentId: string) {
  return await Student.findById(studentId);
}

  async findAllStudents() {
    return await Student.find().select('-password');
  }

async findStudentById(studentId: string) {
  return await Student.findById(studentId).select('-password');
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
