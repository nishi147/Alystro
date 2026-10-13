"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markNotificationAsRead = markNotificationAsRead;
const Notification_js_1 = require("../models/Notification.js");
async function getNotifications(req, res) {
    try {
        const notifications = await Notification_js_1.Notification.find({ recipient: req.user?.userId })
            .sort({ createdAt: -1 })
            .limit(30);
        const unreadCount = await Notification_js_1.Notification.countDocuments({
            recipient: req.user?.userId,
            isRead: false,
        });
        res.json({ success: true, data: { notifications, unreadCount } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function markNotificationAsRead(req, res) {
    try {
        const { id } = req.params;
        await Notification_js_1.Notification.findOneAndUpdate({ _id: id, recipient: req.user?.userId }, { isRead: true });
        res.json({ success: true, message: 'Notification marked as read.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
