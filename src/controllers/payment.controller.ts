// controllers/payment.controller.ts

import { Request, Response } from 'express';
import mongoose, { Schema, Model, Document } from 'mongoose';
import studentSchema from '../models/studentschema.model'; // Adjust path if needed (this exports the raw schema)
import { PaymentService } from '../services/payment.service';
import { CourseRepository } from '../repositories/course.repository';
import { School } from '../models/school.model';

const courseRepo = new CourseRepository();
const paymentService = new PaymentService(courseRepo);

// Define the Student document interface for TypeScript type safety
interface IStudent extends Document {
  fullName: string;
  email: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  password: string;
  image?: string | null;
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
}

export class PaymentController {
  createStripeCheckout = async (req: Request, res: Response): Promise<any> => {
    console.log(req.body, 'body is here');
    try {
      const { courseId, schoolName } = req.params;

      const sessionUrl = await paymentService.createCheckoutSession(
        schoolName,
        courseId,
      );

      res.json({ url: sessionUrl });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };

  saveStripePaymentDetails = async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        schoolId,
        courseId,
        studentId,
        paymentIntentId,
        amount,
        currency,
        status,
        receiptUrl,
        studentEmail,  // Optional in req.body
      } = req.body;

      console.log(req.body, 'body is here');

      if (
        !schoolId ||
        !courseId ||
        !studentId ||
        !paymentIntentId ||
        !amount ||
        !currency ||
        !status
      ) {
        return res.status(400).json({ error: 'Missing required payment details' });
      }

      // Build full subdomain string
      const subDomain = `https://${schoolId}.eduvia.space`;

      // Find school by subdomain (assuming School is in the central DB)
      const school = await School.findOne({ subDomain });

      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      // Switch to the school's specific DB using schoolId as DB name
      const schoolDb = mongoose.connection.useDb(schoolId);
      console.log(schoolDb.name, 'db name');

      // Get or compile the Student model for this specific DB
      const Student: Model<IStudent> = schoolDb.models.Student || schoolDb.model<IStudent>('Student', studentSchema);
      console.log(Student, 'student model');

      // Fetch student email if not provided in body
      let email = studentEmail;
      if (!email) {
        const student = await Student.findById(studentId).exec();
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }
        email = student.email;
        if (!email) {
          return res.status(400).json({ error: 'Student email not found' });
        }
      }

      const saved = await paymentService.savePaymentRecord({
        schoolId: school._id.toString(),
        courseId,
        studentId,
        paymentIntentId,
        amount,
        currency,
        status: status.toLowerCase(),
        receiptUrl,
        studentEmail: email,
      });

      res.status(201).json({ message: 'Payment saved successfully', data: saved });
    } catch (err: any) {
      console.error('Save Payment Error:', err);
      res.status(500).json({ error: err.message });
    }
  };

  getStripeSessionDetails = async (req: Request, res: Response): Promise<any> => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const session = await paymentService.getSessionDetails(sessionId);

      // Pull the necessary info from the session
      const paymentIntent = session.payment_intent;
      const receiptUrl = paymentIntent?.charges?.data?.[0]?.receipt_url;

      res.json({
        payment_intent: paymentIntent?.id,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        charges: paymentIntent?.charges,
        receipt_url: receiptUrl || 'N/A',
      });
    } catch (err: any) {
      console.error('Get Session Error:', err);
      res.status(500).json({ error: err.message });
    }
  };

  checkCoursePurchase = async (req: Request, res: Response): Promise<any> => {
    try {
      const { courseId, studentId } = req.params;

      if (!courseId || !studentId) {
        return res.status(400).json({ error: 'Course ID and Student ID are required' });
      }

      const hasPurchased = await paymentService.checkPurchase(courseId, studentId);

      res.json({ hasPurchased });
    } catch (err: any) {
      console.error('Check Purchase Error:', err);
      res.status(500).json({ error: err.message });
    }
  };
}
