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
    fromDate, // Optional ISO date string, e.g., '2023-01-01'
    toDate,   // Optional ISO date string, e.g., '2023-12-31'
  }: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
  }) {
    let query: any = { isVerified: true }; // Always filter to only verified schools

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

      // Optional handling for isVerified (boolean search) - but since we're always filtering to true, this may be redundant
      // You can remove if not needed, as isVerified is already forced to true
      const lowerSearch = search.toLowerCase();
      if (lowerSearch === 'true' || lowerSearch === 'false') {
        searchQuery.$or.push({ isVerified: lowerSearch === 'true' });
      }

      // Combine with base query
      query = { $and: [query, searchQuery] };
    }

    // Added date range filtering on createdAt (adjust to updatedAt if preferred)
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
      if (Object.keys(query).length === 1 && query.isVerified) { // Only base filter
        query = { ...query, ...dateFilter };
      } else {
        query = { $and: [query, dateFilter] }; // Combine with existing query
      }
    }

    const skip = (page - 1) * limit;
    const sortOptions: Record<string, SortOrder> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    // Use aggregation for reliable sorting with collation
    const aggregation = [
      { $match: query },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit },
      { $project: { password: 0 } }, // Equivalent to .select('-password')
    ];

    // Apply collation as an option to aggregate only for name sorting (case-insensitive)
    let aggregateOptions = {};
    if (sortBy === 'name') {
      aggregateOptions = { collation: { locale: 'en', strength: 2 } };
    }

    const schools = await School.aggregate(aggregation, aggregateOptions);

    const total = await School.countDocuments(query);

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
