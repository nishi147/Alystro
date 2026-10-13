"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const index_js_1 = require("./config/index.js");
const database_js_1 = require("./config/database.js");
async function bootstrap() {
    try {
        await (0, database_js_1.connectDatabase)();
        app_js_1.app.listen(index_js_1.config.port, () => {
            console.log(`=================================================`);
            console.log(`🚀 ALYSTRO Backend API Server Running`);
            console.log(`🌐 Base URL: http://localhost:${index_js_1.config.port}`);
            console.log(`🔌 API Root: http://localhost:${index_js_1.config.port}/api/v1`);
            console.log(`🩺 Health:   http://localhost:${index_js_1.config.port}/health`);
            console.log(`=================================================`);
        });
    }
    catch (error) {
        console.error('Fatal error starting server:', error);
        process.exit(1);
    }
}
bootstrap();
