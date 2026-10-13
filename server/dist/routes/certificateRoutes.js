"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificateController_js_1 = require("../controllers/certificateController.js");
const auth_js_1 = require("../middleware/auth.js");
const tenant_js_1 = require("../middleware/tenant.js");
const router = (0, express_1.Router)();
// Public verification endpoint
router.get('/verify/:certificateId', certificateController_js_1.verifyCertificate);
// Protected routes
router.get('/', auth_js_1.authenticate, tenant_js_1.enforceTenantIsolation, certificateController_js_1.getCertificates);
router.post('/issue', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN'), tenant_js_1.enforceTenantIsolation, certificateController_js_1.issueCertificate);
exports.default = router;
