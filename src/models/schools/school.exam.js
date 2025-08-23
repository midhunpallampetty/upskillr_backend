"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ExamSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    section: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Section' },
}, { timestamps: true });
exports.ExamSchema = ExamSchema;
exports.default = mongoose_1.default.model('Exam', ExamSchema);
