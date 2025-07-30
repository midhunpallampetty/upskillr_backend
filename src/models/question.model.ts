// models/question.ts

import mongoose, { Schema, Document } from "mongoose";

// 1. Option subdocument interface and schema
export interface QuestionOption {
  text: string;
}

const optionSchema = new Schema<QuestionOption>(
  {
    text: { type: String, required: true },
  },
  { _id: false }
);

// 2. Main Question document interface
export interface QuestionDocument extends Document {
  prompt: string;
  options: QuestionOption[];
  correctIdx: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 3. Question schema definition
const questionSchema = new Schema<QuestionDocument>(
  {
    prompt: { type: String, required: true, trim: true },
    options: {
      type: [optionSchema],
      required: true,
      validate: [
        (val: QuestionOption[]) => Array.isArray(val) && val.length >= 2,
        "At least two options are required.",
      ],
    },
    correctIdx: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  }
);

// 4. Ensure correctIdx is in range
questionSchema.pre("validate", function (next) {
  if (this.correctIdx >= this.options.length) {
    this.invalidate(
      "correctIdx",
      "correctIdx must be a valid position inside options array"
    );
  }
  next();
});

// 5. Export typed model
const QuestionModel = mongoose.model<QuestionDocument>("Question", questionSchema);
export default QuestionModel;
