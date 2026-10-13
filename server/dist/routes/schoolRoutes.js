"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schoolController_js_1 = require("../controllers/schoolController.js");
const auth_js_1 = require("../middleware/auth.js");
const tenant_js_1 = require("../middleware/tenant.js");
const router = (0, express_1.Router)();
// Public route for school-specific landing page /schools/:slug
router.get('/public/:slug', schoolController_js_1.getSchoolBySlug);
// Protected routes
router.get('/', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), schoolController_js_1.getSchools);
router.get('/:id', auth_js_1.authenticate, tenant_js_1.enforceTenantIsolation, schoolController_js_1.getSchoolById);
router.post('/', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN'), schoolController_js_1.createSchool);
router.put('/:id', auth_js_1.authenticate, tenant_js_1.enforceTenantIsolation, schoolController_js_1.updateSchool);
router.delete('/:id', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN'), schoolController_js_1.deleteSchool);
exports.default = router;
