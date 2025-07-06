import { connectToSchoolDB } from '../config/connectionManager';
import { getSchoolMetaModel } from '../models/schools/schoolMeta.model';
import { SchoolMetaRepository } from '../repositories/schoolMeta.repository';

export class SchoolDbService {
  async initializeSchoolDb(subDomain: string): Promise<string> {
    const slug = subDomain.split('.')[0].toLowerCase();
    const dbConn = await connectToSchoolDB(slug);

    const SchoolMetaModel = getSchoolMetaModel(dbConn);
    const schoolMetaRepo = new SchoolMetaRepository(SchoolMetaModel);

    const isInitialized = await schoolMetaRepo.isInitialized();
    if (!isInitialized) {
      await schoolMetaRepo.initialize(`Initialized for ${slug}`);
    }

    return slug;
  }
}
