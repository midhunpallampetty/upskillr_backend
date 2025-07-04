// src/models/school/SchoolMeta.ts
import { Connection, Schema, model } from 'mongoose';

export const getSchoolMetaModel = (conn: Connection) => {
  const schema = new Schema({
    createdAt: { type: Date, default: Date.now },
    info: { type: String, required: true },
  });

  return conn.models.SchoolMeta || conn.model('SchoolMeta', schema);
};
