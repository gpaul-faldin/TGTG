import mongoose from "mongoose";
import { CronBuilder } from "@class/CronBuilder.class";
import { Main } from "@class/Main.class";
import FavoriteStore from "@schema/favoriteStore.schema";
import User from "@schema/Users.schema";
import Notifications from "@server/schema/notifications.schema";

export const FavoritesCronJob = async (MainInstance: Main) => {
  return CronBuilder.createAndRun('*/5 * * * * *', async () => {
    try {
      const userInfo = await User.findOne({ email: MainInstance.email });
      if (userInfo) {
        const items = await MainInstance.GetFavoritesInfos();

        const newFavoriteStoreIds: mongoose.Types.ObjectId[] = [];
        for (const item of items) {

          const originalQuantity = await FavoriteStore.findOne(
            { item_id: item.item_id, store_id: item.store_id },
            { quantity: 1 }
          );

          if (originalQuantity && originalQuantity.quantity !== item.quantity) {
            new Notifications({
              subscriptionStatus: {
                FREE: false,
                STARTER: false,
                PLUS: false,
                PRO: false,
              },
              favoriteStores: originalQuantity._id,
              state: 'inactive'
            }).save();
            await FavoriteStore.findByIdAndUpdate(
              originalQuantity._id,
              { $set: { oldQuantity: originalQuantity.quantity } }
            );
            const result = await FavoriteStore.findByIdAndUpdate(
              originalQuantity._id,
              item,
              { new: true }
            );

            if (result)
              newFavoriteStoreIds.push(result._id);
          } else if (!originalQuantity) {
            const newFavoriteStore = new FavoriteStore(item);
            const result = await newFavoriteStore.save();
            newFavoriteStoreIds.push(result._id);
          }
        }

        // First, remove stores not in newFavoriteStoreIds
        await User.updateMany({ email: MainInstance.email }, {
          $pull: { favoriteStores: { $nin: newFavoriteStoreIds } }
        });

        // Then, add stores from newFavoriteStoreIds
        await User.updateMany({ email: MainInstance.email }, {
          $addToSet: { favoriteStores: { $each: newFavoriteStoreIds } }
        });
      }
    } catch (err) {
      console.error('Error while running MainFavoritesCronJob:', err);
    }
  });
}
