import cron from 'node-cron';
import FavoriteStore from "@schema/favoriteStore.schema";
import User from "@schema/Users.schema";

const cleanupOldStores = async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Find outdated FavoriteStore documents and store their _id values
    const deletedStoreIds = await FavoriteStore.find({ updatedAt: { $lt: twentyFourHoursAgo } }, '_id');

    // Delete outdated FavoriteStore documents
    await FavoriteStore.deleteMany({ updatedAt: { $lt: twentyFourHoursAgo } });

    // Remove references from User documents
    if (deletedStoreIds.length > 0) {
      await User.updateMany(
        { favoriteStores: { $in: deletedStoreIds.map(store => store._id) } },
        { $pull: { favoriteStores: { $in: deletedStoreIds.map(store => store._id) } } },
        { multi: true }
      );


      console.log(`Removed outdated favorite stores from users successfully.`);
    } else {
      console.log('No outdated favorite stores found to remove.');
    }
  } catch (err) {
    console.error('Error while running cleanup job:', err);
  }
};

const startCleanupJob = () => {
  cleanupOldStores();

  cron.schedule('0 0 * * *', async () => {
    await cleanupOldStores();
  }).start();
}

export {startCleanupJob};
