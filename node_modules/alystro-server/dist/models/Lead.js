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
exports.Lead = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const LeadSchema = new mongoose_1.Schema({
    schoolName: { type: String, required: true, trim: true, index: true },
    contactPerson: { type: String, required: true, trim: true },
    designation: { type: String },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String },
    estimatedStudents: { type: Number, default: 200 },
    interestedProgram: { type: String },
    classes: [{ type: String }],
    preferredDemoDate: { type: Date },
    message: { type: String },
    leadSource: {
        type: String,
        enum: ['WEBSITE_DEMO', 'REFERRAL', 'INBOUND', 'WORKSHOP', 'OUTREACH'],
        default: 'WEBSITE_DEMO',
    },
    status: {
        type: String,
        enum: ['NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'DEMO_DONE', 'CONVERTED', 'CLOSED'],
        default: 'NEW',
        index: true,
    },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    demoScheduledAt: { type: Date },
    convertedSchool: { type: mongoose_1.Schema.Types.ObjectId, ref: 'School' },
    notes: [
        {
            author: { type: String, required: true },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    timeline: [
        {
            action: { type: String, required: true },
            details: { type: String },
            performedBy: { type: String },
            timestamp: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
exports.Lead = mongoose_1.default.model('Lead', LeadSchema);
