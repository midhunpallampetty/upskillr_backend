// src/repositories/student.repository.ts
import { Student } from '../models/student.model';

export class StudentRepository {
  async findByEmail(email: string) {
    return await Student.findOne({ email });
  }

  async createStudent(data: { fullName: string; email: string; password: string }) {
    return await Student.create(data);
  }
}
