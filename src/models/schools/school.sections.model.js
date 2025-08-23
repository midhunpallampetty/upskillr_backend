"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionSchema = void 0;
// models/schools/section.model.ts
const mongoose_1 = require("mongoose");
exports.SectionSchema = new mongoose_1.Schema({
    sectionName: { type: String, required: true },
    // examRequired: { type: Boolean, default: false },
    videos: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Video' }],
    exam: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Exam' },
    isDeleted: { type: Boolean, default: false },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true });
