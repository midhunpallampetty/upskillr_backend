import { Admin } from '../models/admin.model';

export class AdminRepository {
  async findAdminByEmail(email: string) {
    return await Admin.findOne({ email });
  }

  async createAdmin(email: string, password: string) {
    return await Admin.create({ email, password });
  }
}
