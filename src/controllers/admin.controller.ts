import { Request, Response, NextFunction } from 'express';
import { Admin } from '../models/admin.model';
import { hashPassword, comparePassword } from '../utils/hash';

// Define the handler type explicitly
const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    
    const existing = await Admin.findOne({ email });
    if (existing) {
      res.status(400).json({ msg: 'Admin already exists' });
      return;
    }

    const hashed = await hashPassword(password);
    const admin = await Admin.create({ email, password: hashed });
    res.status(201).json({ msg: 'Admin registered', admin });
  } catch (err) {
    res.status(500).json({ msg: 'Error registering admin' });
  }
};

const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(404).json({ msg: 'Admin not found' });
      return;
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      res.status(400).json({ msg: 'Invalid credentials' });
      return;
    }

    res.status(200).json({ msg: 'Admin logged in', admin });
  } catch (err) {
    res.status(500).json({ msg: 'Login error' });
  }
};

export default { registerAdmin, loginAdmin };