"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCMSByKey = getCMSByKey;
exports.getAllCMS = getAllCMS;
exports.updateCMS = updateCMS;
const CMSContent_js_1 = require("../models/CMSContent.js");
async function getCMSByKey(req, res) {
    try {
        const { key } = req.params;
        const content = await CMSContent_js_1.CMSContent.findOne({ key, published: true });
        if (!content) {
            res.status(404).json({ success: false, message: 'Content not found.' });
            return;
        }
        res.json({ success: true, data: content.data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getAllCMS(req, res) {
    try {
        const contents = await CMSContent_js_1.CMSContent.find().sort({ category: 1 });
        res.json({ success: true, data: contents });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function updateCMS(req, res) {
    try {
        const { key } = req.params;
        const { category, title, data, published } = req.body;
        const content = await CMSContent_js_1.CMSContent.findOneAndUpdate({ key }, {
            category,
            title,
            data,
            published: published !== undefined ? published : true,
            updatedBy: req.user?.userId,
        }, { upsert: true, new: true });
        res.json({ success: true, message: 'Content updated successfully.', data: content });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
