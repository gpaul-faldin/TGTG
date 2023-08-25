// index.ts
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { base64ToText } from './utils/base64ToText';

import orderRoutes from './API/order/orderRoutes';
import favoritesRoutes from './API/favorites/favoritesRoutes';
import usersRoutes from './API/users/usersRoutes';
import reservationRoutes from './API/reservation/reservationRoutes';
import { initializeUserCronJobs } from './cron/userCronInitializer';
import { startCleanupJob } from './cron/cleanupCrontJob';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const Email = process.env.EMAIL;
const Password = process.env.PASSB64;
const MongoUser = process.env.MONGO_USER;
const MongoPass = process.env.MONGO_PASSB64;

if (!Email || !Password || !MongoUser || !MongoPass) {
  throw new Error("Missing environment variables");
}

(async () => {
  try {

    mongoose.connect(`mongodb+srv://${MongoUser}:${base64ToText(MongoPass)}@tgtg.g9qets2.mongodb.net/?retryWrites=true&w=majority`)
      .then(() => {
        console.log('Connected to MongoDB');
      })
      .catch(err => {
        throw new Error("Error connecting to MongoDB");
      });

    app.use('/api/order', orderRoutes);
    app.use('/api/favorites', favoritesRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/reservation', reservationRoutes)

    app.listen(port, () => {
      console.log(`Server up on port: ${port}`);
    });

    //CRON
    startCleanupJob();
    initializeUserCronJobs();

  } catch (error) {
    console.error('An error occurred during initialization:', error);
  }
})();

export default app;
