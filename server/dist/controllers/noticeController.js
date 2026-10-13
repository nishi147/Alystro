"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotices = getNotices;
exports.createNotice = createNotice;
const Notice_js_1 = require("../models/Notice.js");
async function getNotices(req, res) {
    try {
        const query = {};
        if (req.schoolId) {
            query.school = req.schoolId;
        }
        if (req.user?.role === 'STUDENT') {
            query.targetRole = { $in: ['ALL', 'STUDENT'] };
        }
        else if (req.user?.role === 'TEACHER') {
            query.targetRole = { $in: ['ALL', 'TEACHER'] };
        }
        const notices = await Notice_js_1.Notice.find(query)
            .populate('postedBy', 'name role')
            .sort({ pinned: -1, createdAt: -1 });
        res.json({ success: true, data: notices });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function createNotice(req, res) {
    try {
        const { title, content, category, targetRole, pinned } = req.body;
        const schoolId = req.schoolId;
        if (!schoolId) {
            res.status(400).json({ success: false, message: 'School identifier is required.' });
            return;
        }
        const notice = await Notice_js_1.Notice.create({
            school: schoolId,
            title,
            content,
            category: category || 'ANNOUNCEMENT',
            targetRole: targetRole || 'ALL',
            postedBy: req.user?.userId,
            pinned: pinned || false,
        });
        res.status(201).json({ success: true, message: 'Notice posted.', data: notice });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
