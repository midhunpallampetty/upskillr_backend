import { NextFunction, Request, Response } from 'express';
import { Student } from '../models/student.model';
import { hashPassword, comparePassword } from '../utils/hash';

interface StudentBody {
  fullName: string;
  email: string;
  password: string;
}

export const registerStudent = async (
  req: Request<{}, {}, StudentBody>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { fullName, email, password } = req.body;
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Student already exists' });

    const hashed = await hashPassword(password);
    const student = await Student.create({ fullName, email, password: hashed });

    return res.status(201).json({ msg: 'Student registered', student });
  } catch (error) {
    return res.status(500).json({ msg: 'Error registering student' });
  }
};

export const loginStudent = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next:NextFunction
): Promise<any> => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    const isMatch = await comparePassword(password, student.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    return res.status(200).json({ msg: 'Student logged in', student });
  } catch (error) {
    return res.status(500).json({ msg: 'Login error' });
  }
};
