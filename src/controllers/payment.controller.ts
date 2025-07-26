// controllers/payment.controller.ts

import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { CourseRepository } from '../repositories/course.repository';

const courseRepo = new CourseRepository();
const paymentService = new PaymentService(courseRepo);

export class PaymentController {
  createStripeCheckout = async (req: Request, res: Response) => {
    try {
      const { courseId, schoolName } = req.params; // 👈 from route like /payment/:schoolName/:courseId

      const sessionUrl = await paymentService.createCheckoutSession(schoolName, courseId);
      res.json({ url: sessionUrl });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };
}
