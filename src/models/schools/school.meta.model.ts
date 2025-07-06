import mongoose, { Schema, Document } from 'mongoose';

export interface ISchoolMeta extends Document {
  info: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schoolMetaSchema = new Schema<ISchoolMeta>(
  {
    info: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const getSchoolMetaModel = (conn: mongoose.Connection) => {
  return conn.model<ISchoolMeta>('SchoolMeta', schoolMetaSchema);
};
