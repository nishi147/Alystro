"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cmsController_js_1 = require("../controllers/cmsController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Public route to fetch CMS section data
router.get('/public/:key', cmsController_js_1.getCMSByKey);
// Protected CMS admin routes
router.get('/', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), cmsController_js_1.getAllCMS);
router.put('/:key', auth_js_1.authenticate, (0, auth_js_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), cmsController_js_1.updateCMS);
exports.default = router;
