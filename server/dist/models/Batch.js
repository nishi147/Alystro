"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Batch = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BatchSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    school: { type: mongoose_1.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    program: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
    teacher: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    grade: { type: String, required: true },
    section: { type: String, default: 'A' },
    schedule: [
        {
            dayOfWeek: { type: String, required: true },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
        },
    ],
    meetingLink: { type: String, default: 'https://meet.google.com/aly-live-demo' },
    classroomNumber: { type: String },
    status: {
        type: String,
        enum: ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
        default: 'ACTIVE',
        index: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    maxStudents: { type: Number, default: 40 },
    currentStudentCount: { type: Number, default: 0 },
}, { timestamps: true });
exports.Batch = mongoose_1.default.model('Batch', BatchSchema);
