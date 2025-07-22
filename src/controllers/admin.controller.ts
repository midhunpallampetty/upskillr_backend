import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  constructor(private adminService: AdminService) {}


  registerAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const admin = await this.adminService.registerAdmin(email, password);
      res.status(201).json({ msg: 'Admin registered', admin });
    } catch (err: any) {
      res.status(400).json({ msg: err.message || 'Error registering admin' });
    }
  };

  loginAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const admin = await this.adminService.loginAdmin(email, password);
      res.status(200).json({ msg: 'Admin logged in', admin });
    } catch (err: any) {
      res.status(400).json({ msg: err.message || 'Login error' });
    }
  };
}
