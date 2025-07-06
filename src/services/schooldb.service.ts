import { connectToSchoolDB } from '../config/connection.manager';
import { getSchoolMetaModel } from '../models/schools/school.meta.model';
import { SchoolMetaRepository } from '../repositories/schoolmeta.repository';

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
