// src/services/admin.service.ts
import { AdminRepository } from '../repositories/admin.repository';
import { hashPassword, comparePassword } from '../utils/hash';

export class AdminService {
  private adminRepo: AdminRepository;

  constructor() {
    this.adminRepo = new AdminRepository();
  }

  async registerAdmin(email: string, password: string) {
    const existing = await this.adminRepo.findAdminByEmail(email);
    if (existing) {
      throw new Error('Admin already exists');
    }

    const hashed = await hashPassword(password);
    const newAdmin = await this.adminRepo.createAdmin(email, hashed);
    return newAdmin;
  }

  async loginAdmin(email: string, password: string) {
    const admin = await this.adminRepo.findAdminByEmail(email);
    if (!admin) {
      throw new Error('Admin not found');
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return admin;
  }
}
