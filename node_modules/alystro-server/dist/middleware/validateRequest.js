"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const zod_1 = require("zod");
function validateRequest(schema) {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Replace with sanitized parsed data
            if (parsed.body)
                req.body = parsed.body;
            if (parsed.query)
                req.query = parsed.query;
            if (parsed.params)
                req.params = parsed.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorDetails = error.errors.map((e) => ({
                    field: e.path.slice(1).join('.'),
                    message: e.message,
                }));
                res.status(400).json({
                    success: false,
                    message: 'Request validation failed.',
                    errors: errorDetails,
                });
                return;
            }
            next(error);
        }
    };
}
