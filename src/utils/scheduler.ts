import cron from 'node-cron';
import { StudentRepository } from '../repositories/student.repository';

const studentRepo = new StudentRepository();

cron.schedule('*/10 * * * *', async () => {
  const result = await studentRepo.deleteUnverifiedExpiredStudents();
  console.log(`[Cleanup] Deleted ${result.deletedCount} unverified students`);
});
