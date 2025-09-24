import { Types, SortOrder, Connection } from 'mongoose';

export class SchoolRepository {
  // Models should be defined on the tenant DB instance
  private getSchoolModel(db: Connection) {
    return db.model('School');
  }
  private getSchoolSessionModel(db: Connection) {
    return db.model('SchoolSession');
  }

  async findByEmail(db: Connection, email: string) {
    const School = this.getSchoolModel(db);
    return await School.findOne({ email });
  }

  async findBySubdomain(db: Connection, subDomain: string) {
    const School = this.getSchoolModel(db);
    return await School.findOne({ subDomain });
  }

  async saveResetToken(
    db: Connection,
    schoolId: Types.ObjectId,
    token: string,
    expiry: Date
  ) {
    const School = this.getSchoolModel(db);
    return await School.findByIdAndUpdate(schoolId, {
      $set: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });
  }

  async findByResetToken(db: Connection, token: string) {
    const School = this.getSchoolModel(db);
    const now = new Date();
    return await School.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: now },
    });
  }

  async resetPassword(db: Connection, schoolId: Types.ObjectId, hashedPassword: string) {
    const School = this.getSchoolModel(db);
    return await School.findByIdAndUpdate(
      schoolId,
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: '', resetTokenExpiry: '' },
      },
      { new: true }
    );
  }

  async getAllSchools(db: Connection, {
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
    fromDate,
    toDate,
    isVerified,
  }: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
    isVerified?: boolean | undefined;
  }) {
    const School = this.getSchoolModel(db);

    const query: any = {};

    if (typeof isVerified === 'boolean') {
      query.isVerified = isVerified;
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    if (search) {
      const regexSearch = { $regex: search, $options: 'i' };
      const searchConditions = [
        { name: regexSearch },
        { email: regexSearch },
        { address: regexSearch },
        { subDomain: regexSearch },
        { experience: regexSearch },
        { officialContact: regexSearch },
        { city: regexSearch },
        { state: regexSearch },
        { country: regexSearch },
        { image: regexSearch },
        { coverImage: regexSearch },
      ];
      const lowerSearch = search.toLowerCase();
      if (lowerSearch === 'true' || lowerSearch === 'false') {
        searchConditions.push({ isVerified: lowerSearch === 'true' });
      }
      query.$and = query.$and || [];
      query.$and.push({ $or: searchConditions });
    }

    const skip = (page - 1) * limit;
    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    let findQuery = School.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    if (sortBy === 'name') {
      findQuery = findQuery.collation({ locale: 'en', strength: 2 });
    }

    const schools = await findQuery.exec();
    const total = await School.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      schools,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async findById(db: Connection, _id: string) {
    const School = this.getSchoolModel(db);
    return await School.findById(_id);
  }

  async findByOfficialContact(db: Connection, contact: string) {
    const School = this.getSchoolModel(db);
    return await School.findOne({ officialContact: contact });
  }

  async findByIdAndUpdate(db: Connection, _id: string, updateFields: any, options = { new: true }) {
    const School = this.getSchoolModel(db);
    return await School.findByIdAndUpdate(_id, { $set: updateFields }, options);
  }

  async create(db: Connection, schoolData: any) {
    const School = this.getSchoolModel(db);
    return await School.create(schoolData);
  }

  async setBlockStatus(db: Connection, id: string, isBlocked: boolean) {
    const School = this.getSchoolModel(db);
    return await School.findByIdAndUpdate(
      id,
      { $set: { isBlocked } },
      { new: true }
    ).select('-password');
  }

  async createSession(db: Connection, sessionData: any) {
    const SchoolSession = this.getSchoolSessionModel(db);
    return await SchoolSession.create(sessionData);
  }

  async checkVerificationAndSubdomain(db: Connection, schoolId: string): Promise<{ success: boolean; message?: string; subDomain?: string }> {
    const School = this.getSchoolModel(db);
    const school = await School.findById(schoolId).lean();
    if (!school) {
      return { success: false, message: 'School not found' };
    }
    const isValid = school.isVerified === true && !!school.subDomain?.trim();
    return isValid
      ? { success: true, subDomain: school.subDomain }
      : { success: false };
  }
}
