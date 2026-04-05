import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';

mongoose.set('strictQuery', true);

export const connectToMongo = async () => {
  await mongoose.connect(env.mongodbUri);
  logger.info('MongoDB connected');
};

export const disconnectFromMongo = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
