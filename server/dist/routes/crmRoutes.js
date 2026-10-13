"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crmController_js_1 = require("../controllers/crmController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Public lead submission for "Book a Free Demo" & "Partner With Your School" forms
router.post('/', crmController_js_1.createLead);
// Protected CRM routes
router.get('/', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), crmController_js_1.getLeads);
router.put('/:id/status', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), crmController_js_1.updateLeadStatus);
router.post('/:id/convert', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN'), crmController_js_1.convertLeadToSchool);
exports.default = router;
