// src/controllers/schoolDbController.ts
import { Request, Response } from 'express';
import { connectToSchoolDB } from '../config/connectionManager'; // ✅ Use the correct import
import { getSchoolMetaModel } from '../models/schools/schoolMeta.model';

export const initSchoolDb = async (req: Request, res: Response): Promise<any> => {
  const { subDomain } = req.query;

  if (!subDomain || typeof subDomain !== 'string') {
    return res.status(400).json({ msg: '❌ Missing or invalid subdomain' });
  }

  try {
    const slug = subDomain.split('.')[0].toLowerCase(); // e.g., gamersclub
    const dbConn = await connectToSchoolDB(slug); // ✅ Corrected function name
    const SchoolMeta = getSchoolMetaModel(dbConn);

    // Check if already initialized
    const exists = await SchoolMeta.findOne();
    if (!exists) {
      await SchoolMeta.create({ info: `Initialized for ${slug}` });
    }

    return res.status(200).json({ msg: `✅ Connected to DB for ${slug}` });
  } catch (err) {
    console.error('❌ Failed to init school DB:', err);
    return res.status(500).json({ msg: '❌ Failed to connect to school DB' });
  }
};
