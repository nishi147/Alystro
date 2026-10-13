"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
const index_js_1 = require("./index.js");
async function connectDatabase() {
    try {
        if (index_js_1.config.mongoUri.startsWith('mongodb+srv://')) {
            try {
                dns_1.default.setServers(['8.8.8.8', '1.1.1.1']);
            }
            catch {
                // Fallback gracefully if setServers is unavailable
            }
        }
        mongoose_1.default.set('strictQuery', true);
        const conn = await mongoose_1.default.connect(index_js_1.config.mongoUri, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    }
    catch (error) {
        console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
        throw error;
    }
}
async function disconnectDatabase() {
    await mongoose_1.default.disconnect();
    console.log('[Database] MongoDB connection closed');
}
