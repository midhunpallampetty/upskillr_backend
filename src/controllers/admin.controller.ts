import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  constructor(private adminService: AdminService) {}

  registerAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const admin = await this.adminService.registerAdmin(email, password);
      res.status(201).json({ msg: 'Admin registered', admin });
    } catch (err) {
      next(err); // Send error to centralized error handler
    }
  };

// admin.controller.ts
loginAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { admin, accessToken, refreshToken } = await this.adminService.loginAdmin(email, password);

    res.status(200).json({
      msg: '✅ Admin logged in',
      admin,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err); 
  }
};

}
