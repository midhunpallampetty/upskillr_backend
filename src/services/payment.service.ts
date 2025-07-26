// services/payment.service.ts

import { CourseRepository } from '../repositories/course.repository';
import { stripe } from '../config/stripe';
const CLIENT_URL="http://localhost:5173"
export class PaymentService {
  constructor(private courseRepo: CourseRepository) {}

  async createCheckoutSession(schoolName: string, courseId: string): Promise<string> {
    const course = await this.courseRepo.findById(schoolName, courseId);
    if (!course || course.isDeleted) throw new Error('Course not found');

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: 'inr',
        product_data: {
          name: course.courseName,
          images: [course.courseThumbnail],
        },
        unit_amount: course.fee * 100,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${CLIENT_URL}/student/payment-success?courseId=${courseId}`,
  cancel_url: `${CLIENT_URL}/student/payment-cancelled`,
  payment_method_types: ['card'], // ✅ this is valid here
});


    return session.url!;
  }
}
