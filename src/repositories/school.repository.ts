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
  limit = 20,
  fromDate, // Optional ISO date string, e.g., '2023-01-01'
  toDate,   // Optional ISO date string, e.g., '2023-12-31'
  isVerified, // Optional boolean or undefined
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
  let baseQuery: any = {};


  // Build baseQuery depending on isVerified presence
  if (typeof isVerified === 'boolean') {
    if (isVerified) {
      baseQuery.isVerified = true; // only verified
    } else {
      // match both explicitly false and missing field
      baseQuery.$or = [{ isVerified: false }, { isVerified: { $exists: false } }];
    }
  } else {
    // no filter → include all
    baseQuery = {};
  }


  // Expanded search logic for additional fields
  if (search) {
    const regexSearch = { $regex: search, $options: 'i' };


    const searchQuery = {
      $or: [
        { name: regexSearch },
        { email: regexSearch },
        { address: regexSearch },
        { subDomain: regexSearch },
        { experience: regexSearch },      // Assuming string in schema
        { officialContact: regexSearch },
        { city: regexSearch },
        { state: regexSearch },
        { country: regexSearch },
        { image: regexSearch },
        { coverImage: regexSearch },
      ],
    };


    const lowerSearch = search.toLowerCase();
    if (lowerSearch === 'true' || lowerSearch === 'false') {
      searchQuery.$or.push({ isVerified: lowerSearch === 'true' });
    }


    // Combine with base query
    if (Object.keys(baseQuery).length === 0) {
      baseQuery = searchQuery;
    } else {
      baseQuery = { $and: [baseQuery, searchQuery] };
    }
  }


  // Date range filter on createdAt
  const dateQuery: any = {};
  if (fromDate) {
    try {
      dateQuery.$gte = new Date(fromDate);
    } catch (e) {
      throw new Error('Invalid fromDate format');
    }
  }
  if (toDate) {
    try {
      dateQuery.$lte = new Date(toDate);
    } catch (e) {
      throw new Error('Invalid toDate format');
    }
  }
  if (Object.keys(dateQuery).length > 0) {
    const dateFilter = { createdAt: dateQuery };
    if (Object.keys(baseQuery).length === 0) {
      baseQuery = dateFilter;
    } else {
      baseQuery = { $and: [baseQuery, dateFilter] };
    }
  }


  const skip = (page - 1) * limit;
  const sortOptions: Record<string, SortOrder> = {
    [sortBy]: sortOrder === 'asc' ? 1 : -1,
  };


  // Use find() instead of aggregate
  let query = School.find(baseQuery)
    .select('-password')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);


  // Apply collation for name sorting (case-insensitive)
  if (sortBy === 'name') {
    query = query.collation({ locale: 'en', strength: 2 });
  }


  const schools = await query.exec();


  const total = await School.countDocuments(baseQuery);


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

  async findByOfficialContact(contact: string) {
    return await School.findOne({ officialContact: contact });
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

  async checkVerificationAndSubdomain(
    schoolId: string
  ): Promise<{ success: boolean; message?: string; subDomain?: string }> {
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
