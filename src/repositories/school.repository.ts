import { School } from '../models/school.model';
import SchoolSession from '../models/school.session.model';
import { Types, SortOrder } from 'mongoose';

export class SchoolRepository {
  async findByEmail(email: string) {
    return await School.findOne({ email });
  }

  async findBySubdomain(subDomain: string) {
    return await School.findOne({ subDomain });
  }
async saveResetToken(
  schoolId: Types.ObjectId,
  token: string,
  expiry: Date
) {
  return await School.findByIdAndUpdate(schoolId, {
    $set: {
      resetToken: token,
      resetTokenExpiry: expiry,
    },
  });
}

async findByResetToken(token: string) {
  const now = new Date();
  return await School.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: now }, // only valid tokens
  });
}

async resetPassword(schoolId: Types.ObjectId, hashedPassword: string) {
  return await School.findByIdAndUpdate(
    schoolId,
    {
      $set: {
        password: hashedPassword,
      },
      $unset: {
        resetToken: '',
        resetTokenExpiry: '',
      },
    },
    { new: true }
  );
}

  async getAllSchools({
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  }: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } },
            { subDomain: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;
    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [schools, total] = await Promise.all([
      School.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select('-password'),
      School.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      schools,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async findById(_id: string) {
    return await School.findById(_id);
  }

  async findByIdAndUpdate(_id: string, updateFields: any, options = { new: true }) {
    return await School.findByIdAndUpdate(_id, { $set: updateFields }, options);
  }

  async create(schoolData: any) {
    return await School.create(schoolData);
  }

  async createSession(sessionData: any) {
    return await SchoolSession.create(sessionData);
  }
}
