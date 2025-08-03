// services/payment.service.ts

import { CourseRepository } from '../repositories/course.repository';
import { stripe } from '../config/stripe';
import CoursePayment from '../models/course.payment.model';
import { Types } from 'mongoose';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export class PaymentService {
  constructor(private courseRepo: CourseRepository) {}

  async createCheckoutSession(schoolName: string, courseId: string): Promise<string> {
    const course = await this.courseRepo.findById(schoolName, courseId);
    if (!course || course.isDeleted) {
      throw new Error('Course not found or deleted');
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: course.courseName,
              images: [course.courseThumbnail || 'https://via.placeholder.com/150'], // Fallback image
            },
            unit_amount: course.fee * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${CLIENT_URL}/student/payment-success?courseId=${courseId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/student/payment-cancelled`,
      payment_method_types: ['card'],
      metadata: {
        courseId,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return session.url;
  }

async getSessionDetails(sessionId: string): Promise<any> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'payment_intent.charges'],
    });
    return session;
  } catch (error:any) {
    throw new Error(`Failed to retrieve session: ${error.message}`);
  }
}


async savePaymentRecord(data: PaymentData) {
    const { schoolId, courseId, studentId, status, paymentIntentId, amount, currency, receiptUrl } = data;

    if (!['paid', 'failed', 'pending'].includes(status)) {
      throw new Error('Invalid payment status');
    }

    if (!Types.ObjectId.isValid(schoolId)) {
      throw new Error('Invalid schoolId');
    }

    if (!Types.ObjectId.isValid(courseId)) {
      throw new Error('Invalid courseId');
    }

    if (!Types.ObjectId.isValid(studentId)) {
      throw new Error('Invalid studentId');
    }

    const payment = await CoursePayment.create({
schoolId: new Types.ObjectId(data.schoolId),
courseId: new Types.ObjectId(data.courseId),
studentId: new Types.ObjectId(data.studentId),

      paymentStatus: status,
      stripe: {
        paymentIntentId,
        amount,
        currency,
        status,
        receiptUrl: receiptUrl || 'N/A',
      },
    });

    return payment;
  }
  async checkPurchase(courseId: string, studentId: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(courseId)) {
        throw new Error('Invalid courseId');
      }

      if (!Types.ObjectId.isValid(studentId)) {
        throw new Error('Invalid studentId');
      }

      const payment = await CoursePayment.findOne({
        courseId: new Types.ObjectId(courseId),
        studentId: new Types.ObjectId(studentId),
        paymentStatus: 'paid'
      });

      return !!payment;
    } catch (error: any) {
      throw new Error(`Failed to check purchase: ${error.message}`);
    }
  }
}