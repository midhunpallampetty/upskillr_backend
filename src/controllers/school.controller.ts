import { NextFunction, Request, Response } from 'express';
import { School } from '../models/school.model';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateTempEmail } from '../utils/generateTempEmail';
import { LoginBody } from '../types/LoginBody';
import crypto from 'crypto';
import { UpdateSchoolBody } from '../types/updateSchoolBody';
import { generateAccessToken,verifyRefreshToken,generateRefreshToken } from '../utils/jwt';
import mongoose from 'mongoose';
import SchoolSession from '../models/school.SchoolSession';
import {MongoClient}  from 'mongodb';
import  SchoolBody  from '../types/SchoolBody';
import { generateTempPassword } from '../utils/generateTempPassword';
const mongoURI = process.env.MONGO_URL || "mongodb://localhost:27017"; 
console.log(process.env.MONGO_DB_URL,"hai")
export const registerSchool = async (
  req: Request<{}, {}, SchoolBody>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      schoolName,
      experience,
      coursesOffered,
      image,
      coverImage,
      address,
      officialContact,
    } = req.body;

    const tempEmail = generateTempEmail(schoolName);
    const tempPassword = generateTempPassword();

    const existing = await School.findOne({ email: tempEmail });
    if (existing)
      return res.status(400).json({ msg: 'A school with similar name already exists. Please try a variation.' });

    const hashedPassword = await hashPassword(tempPassword);

    const newSchool = await School.create({
      name: schoolName,
      email: tempEmail,
      password: hashedPassword,
      experience,
      coursesOffered,
      isVerified: false,
      image,
      coverImage,
      address,
      officialContact,
    });

    return res.status(201).json({
      msg: 'School registered successfully',
      school: {
        id: newSchool._id,
        email: tempEmail,
        tempPassword, // Optional: only include if allowed to return plaintext password once
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ msg: 'Error registering school' });
  }
};

export const loginSchool = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { email, password } = req.body;

    const school = await School.findOne({ email });
    if (!school) return res.status(404).json({ msg: 'School not found' });

    const isMatch = await comparePassword(password, school.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = {
      id: school._id,
      email: school.email,
      role: 'school',
      subDomain: school.subDomain,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save session in DB
    if(school.subDomain){
      await SchoolSession.create({
        schoolId: school._id,
        schoolName: school.name,
        subDomain: school.subDomain,
        accessToken,
        refreshToken,
      });
    }
  

    return res.status(200).json({
      msg: 'School logged in successfully',
      school: {
        accessToken,
        refreshToken,
        id: school._id,
        name: school.name,
        email: school.email,
        isVerified: school.isVerified,
        coursesOffered: school.coursesOffered,
        image: school.image,
        coverImage: school.coverImage,
        address: school.address,
        officialContact: school.officialContact,
        experience: school.experience,
        subDomain: school.subDomain,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ msg: 'Login error' });
  }
};
export const getAllSchools = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const schools = await School.find().select('-password'); // exclude password field
      console.log(schools)
    return res.status(200).json({
      msg: 'All registered schools retrieved successfully',
      count: schools.length,
      schools,
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return res.status(500).json({ msg: 'Error fetching schools' });
  }
};
export const updateSchool = async (
  req: Request<{}, {}, Partial<UpdateSchoolBody> & { _id: string }>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { _id, ...updateFields } = req.body;

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ msg: 'Valid _id is required in the request body' });
    }

    console.log('Updating school with _id:', _id);
    console.log('Fields to update:', updateFields);

    const updatedSchool = await School.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedSchool) {
      return res.status(404).json({ msg: 'School not found' });
    }

    return res.status(200).json({ msg: 'School updated successfully', school: updatedSchool });
  } catch (error) {
    console.error('Update School Error:', error);
    return res.status(500).json({ msg: 'Failed to update school', error });
  }
};
export const getSchoolBySubdomain = async (
  req: Request<{ subDomain: string }>, 
  res: Response
): Promise<any> => {
  try {
    const { subDomain } = req.query;
console.log(req.body,"sub");

    const school = await School.findOne({ subDomain}); // Use findOne instead of find for a single match

    if (!school) {
      return res.status(404).json({ msg: 'School not found' });
    }

    res.status(200).json({ school });
  } catch (error) {
    console.error('Error finding school by subdomain:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};



export const createSchoolDatabase = async (req: Request, res: Response):Promise<any> => {
  const { schoolName } = req.body;

  if (!schoolName) {
    return res.status(400).json({ error: 'School name is required' });
  }

  const dbName = schoolName.toLowerCase().replace(/\s+/g, '_');

  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const adminDb = client.db().admin();

    const { databases } = await adminDb.listDatabases();

    const exists = databases.some((db) => db.name === dbName);

    if (exists) {
      await client.close();
      return res.status(200).json({ message: `Database "${dbName}" already exists.` });
    }

    // Create a new DB by inserting into a dummy collection
    const newDb = client.db(dbName);
    await newDb.collection('init').insertOne({ createdAt: new Date() });

    await client.close();

    res.status(201).json({ message: `Database "${dbName}" created successfully.` });
  } catch (err) {
    console.error('❌ Failed to create database:', err);
    res.status(500).json({ error: 'Server error while creating database.' });
  }
};