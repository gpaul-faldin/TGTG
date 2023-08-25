import mongoose from "mongoose";
import { CronBuilder } from "../class/CronBuilder.class";
import { Main } from "../class/Main.class";
import FavoriteStore from "../schema/favoriteStore.schema";
import User from "../schema/Users.schema";

const FavoritesCronJob = async (MainInstance: Main) => {
  return CronBuilder.createAndRun('*/1 * * * *', async () => {
    try {
      const items = await MainInstance.GetFavoritesInfos();

      // Update or insert favorite stores
      const newFavoriteStoreIds: mongoose.Types.ObjectId[] = [];
      for (const item of items) {
        const result = await FavoriteStore.findOneAndUpdate(
          { store_id: item.store_id },
          item,
          { upsert: true, new: true }
        );
        newFavoriteStoreIds.push(result._id);
      }

      // First, remove stores not in newFavoriteStoreIds
      await User.updateMany({}, {
        $pull: { favoriteStores: { $nin: newFavoriteStoreIds } }
      });

      // Then, add stores from newFavoriteStoreIds
      await User.updateMany({}, {
        $addToSet: { favoriteStores: { $each: newFavoriteStoreIds } }
      });

    } catch (err) {
      console.error('Error while running MainFavoritesCronJob:', err);
    }
  });
}


export { FavoritesCronJob };
