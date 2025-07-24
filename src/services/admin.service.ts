// src/services/admin.service.ts
import { AdminRepository } from '../repositories/admin.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { AppError } from '../utils/AppError';
import { generateAccessToken ,generateRefreshToken} from '../utils/jwt';

export class AdminService {
  constructor(private adminRepo: AdminRepository) {}

  async registerAdmin(email: string, password: string) {
    const existing = await this.adminRepo.findAdminByEmail(email);
    if (existing) {
      throw new AppError('Admin already exists', 400);
    }

    const hashed = await hashPassword(password);
    const newAdmin = await this.adminRepo.createAdmin(email, hashed);
    return newAdmin;
  }

async loginAdmin(email: string, password: string) {
  const admin = await this.adminRepo.findAdminByEmail(email);
  if (!admin) {
    throw new AppError('Admin not found', 404);
  }

  const isMatch = await comparePassword(password, admin.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // 🧠 Generate tokens using admin ID or other identifying payload
  const payload = { id: admin._id, email: admin.email, role: 'admin' };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    admin,
    accessToken,
    refreshToken,
  };
}
}
