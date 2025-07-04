import crypto from 'crypto';
export const generateTempEmail = (schoolName: string) => {
  const domain = 'upskillr.com'; // You can customize this
  const cleanName = schoolName.toLowerCase().replace(/\s+/g, '');
  const uniquePart = crypto.randomBytes(2).toString('hex');
  return `${cleanName}-${uniquePart}@${domain}`;
};