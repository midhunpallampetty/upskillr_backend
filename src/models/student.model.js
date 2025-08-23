"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Student = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const studentSchema = new mongoose_1.default.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    password: { type: String, required: true },
    image: { type: String, default: null },
    otp: String,
    otpExpires: Date,
    isVerified: {
        type: Boolean,
        default: false,
    },
});
exports.Student = mongoose_1.default.model('Student', studentSchema);
