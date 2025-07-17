import { StudentRepository } from '../repositories/student.repository';
import { hashPassword, comparePassword } from '../utils/hash';

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
}
