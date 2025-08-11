import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  password: { type: String, required: true },
  image:{type:String,default:null},
  otp: String,
otpExpires: Date,

isVerified: {
  type: Boolean,
  default: false,
}, 
});

export const Student = mongoose.model('Student', studentSchema);
