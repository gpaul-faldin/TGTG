import { startCronJobsForOngoingBuyOrders } from "./buyOrder.cron";
import { startCleanupJob } from "./cleanupJob.cron";
import { startSubscriptionCronJob } from "./subscriptionExpiry.cron";
import { FavoriteScanCronInitializer } from "./FavoriteScan.cron";

export const startCronJobs = () => {

  startCleanupJob();
  FavoriteScanCronInitializer();
  startCronJobsForOngoingBuyOrders();
  startSubscriptionCronJob();
}