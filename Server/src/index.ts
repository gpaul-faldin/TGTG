import "module-alias/register";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import { base64ToText } from "@utils/base64ToText";

import favoriteRoutes from "@server/API/favorites/favoriteRoutes";
import usersRoutes from "@server/API/users/usersRoutes";
import reservationRoutes from "@server/API/reservation/reservationRoutes";
import verifySubscription from "@server/API/midleware/verifySubscription";
import { sendSuccess } from "@notifications/discordWebhook";
import payment from "@server/stripe/payment";
import {
  sendEmailCVV,
  sendEmailNotification,
  sendEmailWelcome,
} from "@notifications/email";
import { startCronJobs } from "@server/cron/main.cron";
import Notifications from "@server/schema/notifications.schema";
import FavoriteStore from "@server/schema/favoriteStore.schema";

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

const MongoUser = process.env.MONGO_USER;
const MongoPass = process.env.MONGO_PASSB64;

if (!MongoUser || !MongoPass) {
  throw new Error("Missing environment variables");
}

(async () => {
  try {
    mongoose
      .connect(
        `mongodb+srv://${MongoUser}:${base64ToText(
          MongoPass
        )}@tgtg.g9qets2.mongodb.net/`
      )
      .then(async() => {
        console.log("Connected to MongoDB");
        startCronJobs();
        await sendSuccess("Server started");
      })
      .catch((err) => {
        throw new Error("Error connecting to MongoDB");
      });

    app.listen(port, () => {
      console.log(`Server up on port: ${port}`);
    });

    app.use((req, res, next) => {
      if (req.originalUrl === "/api/stripe/webhook") {
        next();
      } else {
        express.json()(req, res, next);
      }
    });

    app.use("/api/users", usersRoutes);
    app.use('/api/reservation', verifySubscription, reservationRoutes)
    app.use("/api/favorites", favoriteRoutes);
    app.use("/api/stripe", payment);

    app.get("/", (req, res) => {
      res.send({ message: "Hello World" });
    });

    /* TEST ROUTES */

    app.use("/test/a", async (req, res) => {
      res.send("test");
      await sendEmailCVV("paul92g600@live.fr", "http://localhost:5000/");
    });
    app.use("/test/b", async (req, res) => {
      res.send("test");
      await sendEmailWelcome("paul92g600@live.fr");
    });
    app.use("/test/c", async (req, res) => {
      const store = await FavoriteStore.findById("65207b772856f0528ae5836c");
      if (!store) return res.send("KO");
      sendEmailNotification("paul92g600@live.fr", store);
      res.send("OK");
    });

  } catch (error) {
    console.error("An error occurred during initialization:", error);
  }
})();

export default app;
