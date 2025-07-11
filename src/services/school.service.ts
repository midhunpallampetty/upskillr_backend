import { SchoolRepository } from '../repositories/school.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { sendEmail } from '../utils/sendEmail';
import { MongoClient } from 'mongodb';

const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017';

export class SchoolService {
  constructor(private readonly schoolRepository: SchoolRepository) {}

  async register(body: any) {
    const existing = await this.schoolRepository.findByEmail(body.email);
    if (existing) throw new Error('A school with similar name already exists.');

    const hashedPassword = await hashPassword(body.password);
    const newSchool = await this.schoolRepository.create({
      name: body.schoolName,
      email: body.email,
      password: hashedPassword,
      experience: body.experience,
      coursesOffered: body.coursesOffered,
      isVerified: false,
      image: body.image,
      coverImage: body.coverImage,
      address: body.address,
      officialContact: body.officialContact,
    });

    await sendEmail({
      to: body.email,
      subject: 'School Registration Successful – Upskillr',
      html: `
        <h2>Welcome to Upskillr, ${body.schoolName}!</h2>
        <p>Your school registration was successful.</p>
        <p>We will verify your profile shortly. Meanwhile, feel free to explore the platform.</p>
        <br/>
        <p>Thank you,<br/>Team Upskillr</p>
      `,
    });

    return newSchool;
  }

  async login({ email, password }: { email: string; password: string }) {
    const school = await this.schoolRepository.findByEmail(email);
    if (!school) throw new Error('School not found');

    const isMatch = await comparePassword(password, school.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const payload = {
      id: school._id,
      email: school.email,
      role: 'school',
      subDomain: school.subDomain,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    if (school.subDomain) {
      await this.schoolRepository.createSession({
        schoolId: school._id,
        schoolName: school.name,
        subDomain: school.subDomain,
        accessToken,
        refreshToken,
      });
    }

    return { accessToken, refreshToken, school };
  }

  async getAllSchools(filters: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    return this.schoolRepository.getAllSchools(filters);
  }
  

  async update(_id: string, updateFields: any) {
    const existingSchool = await this.schoolRepository.findById(_id);
    if (!existingSchool) {
      throw new Error('School not found');
    }
  
    const updatedSchool = await this.schoolRepository.findByIdAndUpdate(_id, updateFields, { new: true });
    if (!updatedSchool) {
      throw new Error('Failed to update school');
    }
  
    try {
      // 1. Verified email
      if (!existingSchool.isVerified && updateFields.isVerified === true) {
        await sendEmail({
          to: updatedSchool.email,
          subject: 'School Verified – Upskillr',
          html: `
            <h2>Hello ${updatedSchool.name},</h2>
            <p>Your school has been verified by our admin team.</p>
            <p>Your subdomain will be assigned shortly.</p>
            <br/>
            <p>Thanks for being with Upskillr!</p>
          `,
        });
      }
  
      // 2. Subdomain email
      if (!existingSchool.subDomain && updateFields.subDomain) {
        await sendEmail({
          to: updatedSchool.email,
          subject: 'Subdomain Assigned – Upskillr',
          html: `
            <h2>Welcome ${updatedSchool.name},</h2>
            <p>Your subdomain <strong>${updateFields.subDomain}</strong> has been successfully assigned.</p>
            <p>You can now access your school portal using this subdomain.</p>
            <br/>
            <p>Cheers,<br/>Team Upskillr</p>
          `,
        });
      }
    } catch (err) {
      console.error('Email sending failed during school update:', err);
    }
  
    return updatedSchool;
  }
  
  

  async getBySubDomain(subDomain: string) {
    return await this.schoolRepository.findBySubdomain(subDomain);
  }

  async createDatabase(schoolName: string) {
    const dbName = schoolName.toLowerCase().replace(/\s+/g, '_');
    const client = new MongoClient(mongoURI);

    await client.connect();
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();

    const exists = databases.some((db) => db.name === dbName);
    if (exists) {
      await client.close();
      return { exists: true };
    }

    const newDb = client.db(dbName);
    await newDb.collection('init').insertOne({ createdAt: new Date() });

    await client.close();
    return { created: true };
  }
}
