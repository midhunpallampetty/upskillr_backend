import { SchoolRepository } from '../repositories/school.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { sendEmail } from '../utils/sendEmail';
import { MongoClient } from 'mongodb';

const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017';

export class SchoolService {
  constructor(private schoolRepository: SchoolRepository) {}

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
        <h2>Welcome to SkyEdu, ${body.schoolName}!</h2>
        <p>Your school registration was successful.</p>
        <p>We will verify your profile shortly. Meanwhile, feel free to explore the platform.</p>
        <br/>
        <p>Thank you,<br/>Team SkyEdu</p>
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

  async getAll() {
    return await this.schoolRepository.findAll();
  }

  async update(_id: string, updateFields: any) {
    return await this.schoolRepository.findByIdAndUpdate(_id, updateFields);
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
