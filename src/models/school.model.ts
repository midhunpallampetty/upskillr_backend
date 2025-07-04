import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // schoolName
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    experience: { type: String, required: true },
    coursesOffered: { type: [String], required: true },
    isVerified: { type: Boolean, default: false },
    subDomain:{type:String,default:null},
    image: { type: String }, // logo or profile image
    coverImage: { type: String },
    address: { type: String, required: true },
    officialContact: { type: String, required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const School = mongoose.model('School', schoolSchema);
