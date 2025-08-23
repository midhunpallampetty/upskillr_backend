import { Request, Response, NextFunction } from 'express';
import { SchoolService } from '../services/school.service';

export class SchoolController {
  constructor(private schoolService: SchoolService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newSchool = await this.schoolService.register(req.body);
      res.status(201).json({
        msg: 'School registered successfully',
        school: {
          id: newSchool._id,
          email: newSchool.email,
        },
      });
    } catch (error: any) {
      res.status(400).json({ msg: error.message || 'Error registering school' });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<any> => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ msg: 'Email is required' });

      await this.schoolService.forgotPassword(email);

      res.status(200).json({ msg: 'Reset link has been sent if the email exists' });
    } catch (error: any) {
      res.status(500).json({ msg: error.message || 'Something went wrong' });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<any> => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ msg: 'Token and password are required' });

      await this.schoolService.resetPassword(token, password);

      res.status(200).json({ msg: 'Password reset successful' });
    } catch (error: any) {
      res.status(400).json({ msg: error.message || 'Password reset failed' });
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken, school } = await this.schoolService.login(req.body);

      // ✅ Set refresh token as HTTP-only cookie

      // ✅ Send accessToken + school info
      res.status(200).json({
        msg: 'School logged in successfully',
        accessToken, 
        refreshToken,
        school: {
          id: school._id,
          name: school.name,
          email: school.email,
          isVerified: school.isVerified,
          image: school.image,
          coverImage: school.coverImage,
          address: school.address,
          officialContact: school.officialContact,
          experience: school.experience,
          subDomain: school.subDomain,
          city: school.city,
          state: school.state,
          country: school.country,
          role: 'school', // frontend can also use this
        },
      });
    } catch (error: any) {
      res.status(400).json({ msg: error.message || 'Login error' });
    }
  };

getAll = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder: 'asc' | 'desc' =
      (req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;

    const fromDate = (req.query.fromDate as string) || undefined;
    const toDate = (req.query.toDate as string) || undefined;

    let isVerified: boolean | undefined = undefined;
    if (typeof req.query.isVerified === 'string') {
      if (req.query.isVerified.toLowerCase() === 'true') isVerified = true;
      else if (req.query.isVerified.toLowerCase() === 'false') isVerified = false;
    }

    const filters = { search, sortBy, sortOrder, page, limit, fromDate, toDate, isVerified };

    const { schools, total, totalPages } = await this.schoolService.getAllSchools(filters);
console.log(schools, 'Schools retrieved successfully'); // Debug: Log retrieved schools
    res.status(200).json({
      msg: 'Schools retrieved successfully',
      count: schools.length,
      currentPage: page,
      totalPages,
      total,
      schools,
    });
  } catch (error) {
    console.error('Error in getAll:', error);
    res.status(500).json({ msg: 'Error fetching schools' });
  }
};


  update = async (req: Request, res: Response): Promise<any> => {
    try {
      const { _id, ...updateFields } = req.body;
      if (!_id) return res.status(400).json({ msg: 'Valid _id is required' });

      // Ensure coursesOffered is not accidentally sent
      delete (updateFields as any).coursesOffered;

      const updated = await this.schoolService.update(_id, updateFields);
      if (!updated) return res.status(404).json({ msg: 'School not found' });

      res.status(200).json({ msg: 'School updated successfully', school: updated });
    } catch (error) {
      res.status(500).json({ msg: 'Update failed' });
    }
  };

  getBySubDomain = async (req: Request, res: Response): Promise<any> => {
    try {
      const subDomain = req.query.subDomain as string;
      if (!subDomain) return res.status(400).json({ msg: 'subDomain is required' });

      const school = await this.schoolService.getBySubDomain(subDomain);
      if (!school) return res.status(404).json({ msg: 'School not found' });

      res.status(200).json({ school });
    } catch (error) {
      res.status(500).json({ msg: 'Error fetching school by subdomain' });
    }
  };

  createDatabase = async (req: Request, res: Response): Promise<any> => {
    try {
      const { schoolName } = req.body;
      if (!schoolName) return res.status(400).json({ msg: 'School name is required' });

      const result = await this.schoolService.createDatabase(schoolName);
      if (result.exists) return res.status(200).json({ msg: 'Database already exists' });

      res.status(201).json({ msg: 'Database created successfully' });
    } catch (error) {
      res.status(500).json({ msg: 'Database creation failed' });
    }
  };

  checkSchoolStatusController = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params; // school ID from URL
      const result = await this.schoolService.checkSchoolStatusService(id);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error checking school status:', error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  };
}
