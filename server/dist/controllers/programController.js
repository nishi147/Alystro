"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrograms = getPrograms;
exports.getProgramBySlug = getProgramBySlug;
exports.createProgram = createProgram;
exports.updateProgram = updateProgram;
const Program_js_1 = require("../models/Program.js");
async function getPrograms(req, res) {
    try {
        const { gradeLevel, featured } = req.query;
        const query = { published: true };
        if (gradeLevel) {
            query.gradeLevel = gradeLevel;
        }
        if (featured === 'true') {
            query.featured = true;
        }
        const programs = await Program_js_1.Program.find(query).sort({ gradeLevel: 1 });
        res.json({ success: true, data: programs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function getProgramBySlug(req, res) {
    try {
        const program = await Program_js_1.Program.findOne({ slug: req.params.slug });
        if (!program) {
            res.status(404).json({ success: false, message: 'Program not found.' });
            return;
        }
        res.json({ success: true, data: program });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function createProgram(req, res) {
    try {
        const program = await Program_js_1.Program.create(req.body);
        res.status(201).json({ success: true, message: 'Program created successfully.', data: program });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
async function updateProgram(req, res) {
    try {
        const program = await Program_js_1.Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!program) {
            res.status(404).json({ success: false, message: 'Program not found.' });
            return;
        }
        res.json({ success: true, message: 'Program updated successfully.', data: program });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
