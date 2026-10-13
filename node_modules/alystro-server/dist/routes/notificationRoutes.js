"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_js_1 = require("../controllers/notificationController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/', auth_js_1.authenticate, notificationController_js_1.getNotifications);
router.put('/:id/read', auth_js_1.authenticate, notificationController_js_1.markNotificationAsRead);
exports.default = router;
