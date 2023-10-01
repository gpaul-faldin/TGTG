import 'module-alias/register';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { base64ToText } from '@utils/base64ToText';

//import favoritesRoutes from './API/favorites/favoritesRoutes';
import usersRoutes from '@server/API/users/usersRoutes';
import reservationRoutes from '@server/API/reservation/reservationRoutes';
import { initializeUserCronJobs } from '@cron/userCronInitializer';
import { startCleanupJob } from '@cron/cleanupCrontJob';
import { startCronJobsForOngoingBuyOrders } from '@cron/buyOrder';
import { sendSuccess } from '@notifications/discordWebhook';

import { sendEmailCVV, sendEmailWelcome } from '@notifications/email';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

const MongoUser = process.env.MONGO_USER;
const MongoPass = process.env.MONGO_PASSB64;

if (!MongoUser || !MongoPass) {
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

    app.use('/api/users', usersRoutes);
    app.use('/api/reservation', reservationRoutes)


    app.get('/', (req, res) => {
      res.send({message: "Hello World"})
    })

    app.use('/test/a', async(req, res) => {
      res.send("test")
      await sendEmailCVV("paul92g600@live.fr", "http://localhost:5000/")
    })

    app.use('/test/b', async (req, res) => {
      res.send("test")
      await sendEmailWelcome("paul92g600@live.fr")
    })

    app.listen(port, () => {
      console.log(`Server up on port: ${port}`);
    });

    //CRON
    startCleanupJob();
    initializeUserCronJobs();
    startCronJobsForOngoingBuyOrders();
    await sendSuccess("Server started")

  } catch (error) {
    console.error('An error occurred during initialization:', error);
  }
})();

export default app;
