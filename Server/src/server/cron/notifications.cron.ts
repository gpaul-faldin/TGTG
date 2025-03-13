import cron from "node-cron";
import { CronBuilder } from "@server/class/CronBuilder.class";
import User, { UserDocument } from "@schema/Users.schema";
import Notifications, {
  NotificationsDocument,
} from "@server/schema/notifications.schema";
import { NotifHandler } from "@server/notifications/handler";

const schedule = {
  FREE: "*/30 * * * * *",
  STARTER: "*/30 * * * * *",
  PLUS: "*/15 * * * * *",
  PRO: "*/5 * * * * *",
};

const NotificationsCronInitializer = async (
  notification: NotificationsDocument
) => {
  const FREE = cron.schedule(schedule["FREE"], async () => {
    const users: Array<UserDocument> = await User.find({
      subscription: "FREE",
      active: true,
      favoriteStores: notification.favoriteStores,
      "notif.active": true,
    });

    for (let i = 0; i < users.length; i++) {
      if (users[i].notif.quantity < 25) {
        NotifHandler(
          users[i].notif.method,
          users[i].notif.info,
          notification.favoriteStores
        );
        await User.findByIdAndUpdate(users[i]._id, {
          $inc: { "notif.quantity": 1 },
        });
      }
      //Free tier can only receive 25 emails per month
    }
    console.log("FREE OK");
    notification.subscriptionStatus.FREE = true;

    if (
      notification.subscriptionStatus.FREE &&
      notification.subscriptionStatus.STARTER &&
      notification.subscriptionStatus.PLUS &&
      notification.subscriptionStatus.PRO
    ) {
      await Notifications.findByIdAndRemove(notification._id);
      console.log("NOTIFICATION DONE");
    }
    FREE.stop();
  });
  const STARTER = cron.schedule(schedule["STARTER"], async () => {
    const users = await User.find({
      subscription: "STARTER",
      active: true,
      favoriteStores: notification.favoriteStores,
      "notif.active": true,
    });

    for (let i = 0; i < users.length; i++) {
      NotifHandler(
        users[i].notif.method,
        users[i].notif.info,
        notification.favoriteStores
      );
    }
    console.log("STARTER OK");
    notification.subscriptionStatus.STARTER = true;

    if (
      notification.subscriptionStatus.FREE &&
      notification.subscriptionStatus.STARTER &&
      notification.subscriptionStatus.PLUS &&
      notification.subscriptionStatus.PRO
    ) {
      await Notifications.findByIdAndRemove(notification._id);
      console.log("NOTIFICATION DONE");
    }
    STARTER.stop();
  });
  const PLUS = cron.schedule(schedule["PLUS"], async () => {
    const users = await User.find({
      subscription: "PLUS",
      active: true,
      favoriteStores: notification.favoriteStores,
      "notif.active": true,
    });

    for (let i = 0; i < users.length; i++) {
      NotifHandler(
        users[i].notif.method,
        users[i].notif.info,
        notification.favoriteStores
      );
    }
    console.log("PLUS OK");
    notification.subscriptionStatus.PLUS = true;

    if (
      notification.subscriptionStatus.FREE &&
      notification.subscriptionStatus.STARTER &&
      notification.subscriptionStatus.PLUS &&
      notification.subscriptionStatus.PRO
    ) {
      await Notifications.findByIdAndRemove(notification._id);
      console.log("NOTIFICATION DONE");
    }
    PLUS.stop();
  });
  const PRO = cron.schedule(schedule["PRO"], async () => {
    if (notification.state === "inactive") {
      await Notifications.findByIdAndUpdate(notification._id, {
        state: "active",
      });
    }
    const users = await User.find({
      subscription: "PRO",
      active: true,
      favoriteStores: notification.favoriteStores,
      "notif.active": true,
    });

    for (let i = 0; i < users.length; i++) {
      NotifHandler(
        users[i].notif.method,
        users[i].notif.info,
        notification.favoriteStores
      );
    }
    console.log("PRO OK");
    notification.subscriptionStatus.PRO = true;

    if (
      notification.subscriptionStatus.PRO &&
      notification.subscriptionStatus.STARTER &&
      notification.subscriptionStatus.PLUS &&
      notification.subscriptionStatus.PRO
    ) {
      await Notifications.findByIdAndUpdate(notification._id, {
        state: "done",
      });
      console.log("NOTIFICATION DONE");
    }
    PRO.stop();
  });
};

export const NotificationsCronJob = async () => {
  CronBuilder.createAndRun("*/5 * * * * *", async () => {
    try {
      const notifArray = await Notifications.find({ state: "inactive" });
      await Notifications.updateMany(
        { state: "inactive" },
        { state: "active" }
      );

      for (let x = 0; x < notifArray.length; x++) {
        NotificationsCronInitializer(notifArray[x]);
      }
    } catch (error) {
      console.error("Error initializing user cron jobs:", error);
    }
  });
};
