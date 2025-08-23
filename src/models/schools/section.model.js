"use strict";
// models/schools/section.model.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SectionSchema = new mongoose_1.default.Schema({
    sectionName: { type: String, required: true },
    examRequired: { type: Boolean, default: false },
    videos: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Video' }],
    exam: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Exam' },
    course: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true });
exports.SectionSchema = SectionSchema;
// ✅ Default export (optional, if you're using it somewhere else)
exports.default = mongoose_1.default.model('Section', SectionSchema);
