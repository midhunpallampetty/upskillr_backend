// services/payment.service.ts

import { CourseRepository } from '../repositories/course.repository';
import { stripe } from '../config/stripe';
import CoursePayment from '../models/course.payment.model';
import { Types, model, models, connection } from 'mongoose';
import { sendEmail } from '../utils/sendEmail';
import { School } from '../models/school.model';  // Import School model (central DB)
import studentSchema from '../models/studentschema.model';  // Import the student schema
import puppeteer from 'puppeteer';
import cloudinary from '../config/cloudinary';
const CLIENT_URL = 'https://eduvia.space';

// Define the Student document interface for TypeScript type safety
interface IStudent extends Document {
  fullName: string;
  email: string;
  // Add other fields as needed
}

export class PaymentService {
  constructor(private courseRepo: CourseRepository) {}

  async createCheckoutSession(schoolName: string, courseId: string): Promise<string> {
    const course = await this.courseRepo.findById(schoolName, courseId);
    if (!course || course.isDeleted) {
      throw new Error('Course not found or deleted');
    }
    let paymentUrl = `https://${schoolName}.eduvia.space`;
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
      success_url: `${paymentUrl}/student/payment-success?courseId=${courseId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${paymentUrl}/student/payment-cancelled`,
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
    } catch (error: any) {
      throw new Error(`Failed to retrieve session: ${error.message}`);
    }
  }

  async savePaymentRecord(data: PaymentData) {
    const { schoolId, courseId, studentId, status, paymentIntentId, amount, currency, receiptUrl, studentEmail: providedEmail } = data;
    
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
    
    // Find school from central DB to get subdomain and confirm existence
    const school = await School.findById(schoolId);
    if (!school) {
      throw new Error('School not found');
    }
    
    // Extract schoolName from subDomain (e.g., 'gamersclub' from 'https://gamersclub.eduvia.space')
    let schoolName = '';
    if (school.subDomain) {
      try {
        const parsedUrl = new URL(school.subDomain);
        const hostname = parsedUrl.hostname;
        schoolName = hostname.split('.')[0];
      } catch (err) {
        console.error("Invalid URL:", school.subDomain);
        throw new Error('Invalid school subdomain');
      }
    }
    if (!schoolName) {
      throw new Error('Unable to fetch schoolName');
    }
    
    // Switch to the school's specific DB
    const schoolDb = connection.useDb(schoolName); // Assuming schoolId is the DB name
    console.log(schoolDb.name, 'Switched to school DB');
    
    // Get or compile the Student model for this specific DB
    const Student = schoolDb.models.Student || schoolDb.model<IStudent>('Student', studentSchema);
    
    // Fetch student details
    const student = await Student.findById(studentId).exec();
    if (!student) {
      throw new Error('Student not found');
    }
    const fullName = student.fullName || 'Student';
    const email = providedEmail || student.email;
    if (!email) {
      throw new Error('Student email not found');
    }
    
    // Fetch course details (assuming courseRepo handles DB correctly)
    const course = await this.courseRepo.findById(schoolName, courseId);
    const courseName = course?.courseName || 'Your Course';
    
    // Create payment record (assuming CoursePayment is in central or appropriate DB)
    const payment = await CoursePayment.create({
      schoolId: new Types.ObjectId(schoolId),
      courseId: new Types.ObjectId(courseId),
      studentId: new Types.ObjectId(studentId),
      paymentStatus: status,
      stripe: {
        paymentIntentId,
        amount,
        currency,
        status,
      },
    });
    
    // If payment is successful, generate invoice and send email
    if (status === 'paid') {
      let paymentUrl = '';
      try {
        const dateIssued = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const formattedAmount = `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
        
        // HTML template for invoice (unchanged)
        const htmlContent = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; background-color: #f9f9f9; }
                .invoice { border: 1px solid #ddd; padding: 30px; max-width: 800px; margin: auto; background-color: white; }
                h1 { font-size: 28px; margin-bottom: 20px; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #666; }
              </style>
            </head>
            <body>
              <div class="invoice">
                <h1>Payment Invoice</h1>
                <p><strong>Invoice To:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>School:</strong> ${schoolName}</p>
                <p><strong>Course:</strong> ${courseName}</p>
                <p><strong>Payment Date:</strong> ${dateIssued}</p>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Course Enrollment: ${courseName}</td>
                      <td>${formattedAmount}</td>
                    </tr>
                  </tbody>
                </table>
                <p><strong>Total Paid:</strong> ${formattedAmount}</p>
                <p><strong>Payment Status:</strong> Paid</p>
                <p><strong>Payment Intent ID:</strong> ${paymentIntentId}</p>
                <div class="footer">Thank you for your payment. If you have any questions, contact support.</div>
              </div>
            </body>
          </html>
        `;
        
        // Generate PDF with Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('screen');
        
        const pdfBytes = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '50px', right: '50px', bottom: '50px', left: '50px' }
        });
        
        await browser.close();
        
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({
            folder: 'invoices',
            resource_type: 'raw',
            public_id: `invoice_${studentId}_${courseId}_${paymentIntentId}.pdf`
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          stream.end(pdfBytes);
        });
        
        if (uploadResult && (uploadResult as any).secure_url) {
          paymentUrl = (uploadResult as any).secure_url;
        } else {
          throw new Error('Cloudinary upload succeeded but no secure_url returned');
        }
        
      } catch (error) {
        console.error('Invoice generation or upload error:', error);
        paymentUrl = ''; // Proceed without blocking
      }
      
      // Prepare email content
      const paymentLink = paymentUrl 
        ? `<p>Payment URL: <a href="${paymentUrl}">View Invoice</a></p>` 
        : '<p>No payment invoice available at this time. Please contact support if needed.</p>';
      
      // Send email
      await sendEmail({
        to: email,
        subject: 'Payment Successful - Enrollment Confirmed',
        html: `
          <h3>Hello ${fullName},</h3>
          <p>Thank you for your purchase! Your payment for <strong>${courseName}</strong> was successful.</p>
          <p>Amount: ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}</p>
          ${paymentLink}
          <p>Access your course at: <a href="https://eduvia.space/student/course-page/${schoolName}/${courseId}">Click here</a></p>
          <p>If you have questions, reply to this email.</p>
          <br/>     
          <p>– Your Platform Team</p>
        `,
      }).catch((error: any) => {
        console.error('Email send error:', error);  // Log but don't throw
      });
    }
    
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

interface PaymentData {
  schoolId: string;
  courseId: string;
  studentId: string;
  status: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  receiptUrl?: string;
  studentEmail?: string;  // Optional: can be provided or fetched
}
