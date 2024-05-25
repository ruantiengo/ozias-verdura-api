import mongoose from 'mongoose';

import { env } from '@/common/utils/envConfig';
import { app, logger } from '@/server';

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(
      `mongodb://${env.MONGO_INITDB_ROOT_USERNAME}:${env.MONGO_INITDB_ROOT_PASSWORD}@mongodb:27017/ozias-verdura?`,
      {
        authSource: 'admin',
      }
    );
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

// Iniciar a aplicação
const startServer = () => {
  const server = app.listen(env.PORT, () => {
    const { NODE_ENV, HOST, PORT } = env;
    logger.info(`Server (${NODE_ENV}) running on http://${HOST}:${PORT}`);
  });

  const onCloseSignal = () => {
    logger.info('sigint received, shutting down');
    server.close(() => {
      logger.info('server closed');
      mongoose.connection.close();
    });
    setTimeout(() => process.exit(1), 10000).unref(); // Forçar desligamento após 10s
  };

  process.on('SIGINT', onCloseSignal);
  process.on('SIGTERM', onCloseSignal);
};

connectToMongoDB().then(startServer);
