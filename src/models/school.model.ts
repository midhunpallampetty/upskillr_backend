import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    experience: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    subDomain: { type: String, default: null },
    image: { type: String }, 
    coverImage: { type: String },
    address: { type: String, required: true },
    officialContact: { type: String, required: true },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const School = mongoose.model('School', schoolSchema);
