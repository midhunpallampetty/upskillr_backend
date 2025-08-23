"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchoolMetaModel = void 0;
const mongoose_1 = require("mongoose");
const schoolMetaSchema = new mongoose_1.Schema({
    info: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const getSchoolMetaModel = (conn) => {
    return conn.model('SchoolMeta', schoolMetaSchema);
};
exports.getSchoolMetaModel = getSchoolMetaModel;
