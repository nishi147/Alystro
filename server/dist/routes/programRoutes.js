"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const programController_js_1 = require("../controllers/programController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Public routes for catalog and details
router.get('/', programController_js_1.getPrograms);
router.get('/:slug', programController_js_1.getProgramBySlug);
// Admin routes
router.post('/', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), programController_js_1.createProgram);
router.put('/:id', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), programController_js_1.updateProgram);
exports.default = router;
