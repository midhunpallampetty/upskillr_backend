import crypto from "crypto";
export const generateTempPassword = () => {
  return crypto.randomBytes(4).toString('hex'); // 8 character temp password
};