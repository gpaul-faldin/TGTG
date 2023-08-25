import cron from 'node-cron';
import FavoriteStore from "../schema/favoriteStore.schema";

const cleanupOldStores = async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    await FavoriteStore.deleteMany({ updatedAt: { $lt: twentyFourHoursAgo } });

    console.log("Old favorite stores removed successfully.");
  } catch (err) {
    console.error("Error while running cleanup job:", err);
  }
}

const startCleanupJob = () => {
  cleanupOldStores();

  cron.schedule('0 0 * * *', async () => {
    await cleanupOldStores();
  }).start();
}

export {startCleanupJob};
