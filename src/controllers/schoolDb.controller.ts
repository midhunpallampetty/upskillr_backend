import { Request, Response } from 'express';
import { SchoolDbService } from '../services/schooldb.service';

export class SchoolDbController {
  private schoolDbService: SchoolDbService;

  constructor() {
    this.schoolDbService = new SchoolDbService();
  }

  public initSchoolDb = async (req: Request, res: Response): Promise<void> => {
    const { subDomain } = req.query;

    if (!subDomain || typeof subDomain !== 'string') {
      res.status(400).json({ msg: '❌ Missing or invalid subdomain' });
      return;
    }

    try {
      const slug = await this.schoolDbService.initializeSchoolDb(subDomain);
      res.status(200).json({ msg: `✅ Connected to DB for ${slug}` });
    } catch (error) {
      console.error('❌ Failed to init school DB:', error);
      res.status(500).json({ msg: '❌ Failed to connect to school DB' });
    }
  };
}
