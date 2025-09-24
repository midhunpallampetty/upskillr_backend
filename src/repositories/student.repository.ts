// Updated Student Repository (aligned with reference: dynamic model compilation with check)
import mongoose from 'mongoose';
import studentSchema from '../models/studentschema.model'; // Assuming schema is exported as studentSchema
import CoursePayment from '../models/course.payment.model';

export class StudentRepository {
  private getModels(schoolName: string) {
    console.log(schoolName,'schoolname in repo');
    const db = mongoose.connection.useDb(schoolName);
    console.log(db.name,'db name');
    const Student = db.models.Student || db.model('Student', studentSchema);
    console.log(Student,'student model');
    return { Student };
  }

  async findByEmail(schoolName: string, email: string) {
    const { Student } = this.getModels(schoolName);
    return await Student.findOne({ email });
  }

  async deleteUnverifiedExpiredStudents(schoolName: string) {
    const now = new Date();
    const { Student } = this.getModels(schoolName);
    return await Student.deleteMany({
      isVerified: false,
      otpExpires: { $lt: now },
    });
  }

  async createStudent(schoolName: string, data: {
    fullName: string;
    email: string;
    password: string;
    otp?: string;
    otpExpires?: Date;
  }) {
    const { Student } = this.getModels(schoolName);
    return await Student.create(data);
  }

  async verifyOtp(schoolName: string, email: string, otp: string) {
    const { Student } = this.getModels(schoolName);
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

  async resendOtp(schoolName: string, email: string, otp: string, otpExpires: Date) {
    const { Student } = this.getModels(schoolName);
    return await Student.findOneAndUpdate(
      { email },
      { otp, otpExpires },
      { new: true }
    );
  }

  async updateStudent(schoolName: string, studentId: string, updates: Partial<{ fullName: string; image: string; password: string }>) {
    const { Student } = this.getModels(schoolName);
    return await Student.findByIdAndUpdate(studentId, updates, { new: true }).select('-password');
  }

  async findById(schoolName: string, studentId: string) {
    const { Student } = this.getModels(schoolName);
    return await Student.findById(studentId);
  }

  async findAllStudents(schoolName: string, schoolId: string) {
    console.log("School ID in repo:", schoolId);
    
    const enrolledStudentIds = await CoursePayment.find({
      schoolId: schoolId,
    }).distinct("studentId");

    const { Student } = this.getModels(schoolName);
    return await Student.find({
      _id: { $in: enrolledStudentIds },
    }).select("-password");
  }

  async findStudentById(schoolName: string, studentId: string) {
    const { Student } = this.getModels(schoolName);
    return await Student.findById(studentId).select('-password');
  }

  async setResetToken(schoolName: string, email: string, token: string, expires: Date) {
    const { Student } = this.getModels(schoolName);
    return await Student.findOneAndUpdate(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expires },
      { new: true }
    );
  }

  async findByResetToken(schoolName: string, email: string, token: string) {
    const { Student } = this.getModels(schoolName);
    return await Student.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
  }

  async updatePassword(schoolName: string, studentId: string, hashedPassword: string) {
    const { Student } = this.getModels(schoolName);
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
