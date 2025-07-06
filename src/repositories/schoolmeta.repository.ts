import { Model } from 'mongoose';
import { ISchoolMeta } from '../models/schools/school.meta.model';

export class SchoolMetaRepository {
  private SchoolMeta: Model<ISchoolMeta>;

  constructor(SchoolMetaModel: Model<ISchoolMeta>) {
    this.SchoolMeta = SchoolMetaModel;
  }

  async isInitialized(): Promise<boolean> {
    const meta = await this.SchoolMeta.findOne();
    return !!meta;
  }

  async initialize(info: string): Promise<void> {
    await this.SchoolMeta.create({ info });
  }
}
