"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VideoSchema = new mongoose_1.default.Schema({
    videoName: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String },
    section: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Section' },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });
exports.VideoSchema = VideoSchema;
exports.default = mongoose_1.default.model('Video', VideoSchema);
