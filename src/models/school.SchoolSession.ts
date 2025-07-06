import mongoose, { Schema, Document } from 'mongoose';

export interface ISchoolSession extends Document {
  schoolId: mongoose.Types.ObjectId;
  schoolName: string;
  subDomain: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
}

const SchoolSessionSchema = new Schema<ISchoolSession>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  schoolName: { type: String, required: true },
  subDomain: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SchoolSession = mongoose.model<ISchoolSession>('SchoolSession', SchoolSessionSchema);

export default SchoolSession;
