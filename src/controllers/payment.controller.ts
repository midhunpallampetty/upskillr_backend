// controllers/payment.controller.ts

import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { CourseRepository } from '../repositories/course.repository';
import { School } from '../models/school.model';

const courseRepo = new CourseRepository();
const paymentService = new PaymentService(courseRepo);

export class PaymentController {
  createStripeCheckout = async (req: Request, res: Response):Promise<any> => {
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
      schoolId, // contains 'gamersclub'
      courseId,
      studentId,
      paymentIntentId,
      amount,
      currency,
      status,
      receiptUrl,
    } = req.body;

    console.log(req.body, 'body is here');

    if (
      !schoolId || // still required
      !courseId ||
      !studentId ||
      !paymentIntentId ||
      !amount ||
      !currency ||
      !status
    ) {
      return res.status(400).json({ error: 'Missing required payment details' });
    }

    // 🟡 Build full subdomain string
    const subDomain = `http://${schoolId}.localhost:5173`;

    // 🔍 Find school by subdomain
    const school = await School.findOne({ subDomain });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const saved = await paymentService.savePaymentRecord({
      schoolId: school._id,
      courseId,
      studentId,
      paymentIntentId,
      amount,
      currency,
      status: status.toLowerCase(),
      receiptUrl,
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
