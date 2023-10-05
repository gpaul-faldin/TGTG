import { startCronJobsForOngoingBuyOrders } from "./buyOrder";
import { startCleanupJob } from "./cleanupCrontJob";
import { initializeBotCron } from "./initializeBotCron";
import { startSubscriptionCronJob } from "./subscriptionExpiry";
import { initializeUserCronJobs } from "./userCronInitializer";

export const startCronJobs = () => {

startCleanupJob();
initializeUserCronJobs();
//initializeBotCron();
startCronJobsForOngoingBuyOrders();
startSubscriptionCronJob();
}