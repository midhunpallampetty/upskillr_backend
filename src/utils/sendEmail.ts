import nodemailer from 'nodemailer';
import { MailOptions } from '../types/mail.options';
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, 
    secure: false, 
    auth: {
      user:  "midhunps762@gmail.com",
      pass: "ryzu bhoc sbmv unup ", 
    },
    debug: true, 
    logger: true, 
  });



export const sendEmail = async ({ to, subject, html }: MailOptions) => {
  await transporter.sendMail({
    from: `"Upskillr Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
