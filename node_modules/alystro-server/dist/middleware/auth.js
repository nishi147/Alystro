"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorizeRoles = authorizeRoles;
const jwt_js_1 = require("../utils/jwt.js");
const User_js_1 = require("../models/User.js");
async function authenticate(req, res, next) {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.alystro_token) {
            token = req.cookies.alystro_token;
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. Please sign in to continue.',
            });
            return;
        }
        const decoded = (0, jwt_js_1.verifyToken)(token);
        // Verify user is active in DB
        const user = await User_js_1.User.findById(decoded.userId);
        if (!user || user.status !== 'ACTIVE') {
            res.status(401).json({
                success: false,
                message: 'User session is invalid or account is suspended.',
            });
            return;
        }
        req.user = {
            ...decoded,
            _id: decoded.userId,
            schoolId: user.school?.toString(),
        };
        if (req.user.schoolId) {
            req.schoolId = req.user.schoolId;
        }
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired session token. Please sign in again.',
        });
    }
}
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] permissions.`,
            });
            return;
        }
        next();
    };
}
