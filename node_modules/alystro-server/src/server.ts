import { app } from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';

async function bootstrap() {
  try {
    await connectDatabase();
    app.listen(config.port, () => {
      console.log(`=================================================`);
      console.log(`🚀 ALYSTRO Backend API Server Running`);
      console.log(`🌐 Base URL: http://localhost:${config.port}`);
      console.log(`🔌 API Root: http://localhost:${config.port}/api/v1`);
      console.log(`🩺 Health:   http://localhost:${config.port}/health`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

bootstrap();
