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

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken, school } = await this.schoolService.login(req.body);

      res.status(200).json({
        msg: 'School logged in successfully',
        school: {
          accessToken,
          refreshToken,
          id: school._id,
          name: school.name,
          email: school.email,
          isVerified: school.isVerified,
          coursesOffered: school.coursesOffered,
          image: school.image,
          coverImage: school.coverImage,
          address: school.address,
          officialContact: school.officialContact,
          experience: school.experience,
          subDomain: school.subDomain,
        },
      });
    } catch (error: any) {
      res.status(400).json({ msg: error.message || 'Login error' });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const schools = await this.schoolService.getAll();
      res.status(200).json({
        msg: 'All registered schools retrieved successfully',
        count: schools.length,
        schools,
      });
    } catch (error) {
      res.status(500).json({ msg: 'Error fetching schools' });
    }
  };

  update = async (req: Request, res: Response): Promise<any> => {
    try {
      const { _id, ...updateFields } = req.body;
      if (!_id) return res.status(400).json({ msg: 'Valid _id is required' });

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
}
