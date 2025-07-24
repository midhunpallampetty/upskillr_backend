// src/repositories/admin.repository.ts
import { Admin } from '../models/admin.model';
import { AppError } from '../utils/AppError';

export class AdminRepository {
  async findAdminByEmail(email: string) {
    try {
      return await Admin.findOne({ email });
    } catch (error: any) {
      throw new AppError('Failed to find admin by email', 500);
    }
  }

  async createAdmin(email: string, password: string) {
    try {
      return await Admin.create({ email, password });
    } catch (error: any) {
      throw new AppError('Failed to create admin', 500);
    }
  }
}
