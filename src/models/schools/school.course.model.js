"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSchema = void 0;
// models/schools/school.course.model.ts
const mongoose_1 = require("mongoose");
exports.CourseSchema = new mongoose_1.Schema({
    courseName: { type: String, required: true },
    isPreliminaryRequired: { type: Boolean, default: false },
    courseThumbnail: { type: String },
    fee: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
    sections: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Section' }],
    forum: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Forum' },
    school: { type: mongoose_1.Schema.Types.ObjectId, ref: 'School', required: true },
    description: { type: String, default: null },
    preliminaryExam: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Exam', default: null },
    finalExam: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Exam', default: null }
}, { timestamps: true });
