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
exports.Program = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProgramSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    gradeLevel: {
        type: String,
        enum: ['CLASS_6_8', 'CLASS_9_10', 'CLASS_11_12'],
        required: true,
        index: true,
    },
    category: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    durationMonths: { type: Number, default: 3 },
    sessionDurationMinutes: { type: Number, default: 45 },
    mode: { type: String, enum: ['ONLINE', 'OFFLINE', 'HYBRID'], default: 'HYBRID' },
    features: [{ type: String }],
    learningOutcomes: [{ type: String }],
    syllabus: [
        {
            month: { type: Number, required: true },
            title: { type: String, required: true },
            description: { type: String },
            topics: [{ type: String }],
        },
    ],
    banner: { type: String },
    badge: { type: String },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
}, { timestamps: true });
exports.Program = mongoose_1.default.model('Program', ProgramSchema);
