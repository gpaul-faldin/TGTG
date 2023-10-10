import mongoose from "mongoose";
import { CronBuilder } from "@class/CronBuilder.class";
import { Main } from "@class/Main.class";
import FavoriteStore, { FavoriteStoreDocument } from "@schema/favoriteStore.schema";
import User from "@schema/Users.schema";
import Notifications from "@server/schema/notifications.schema";

export const FavoritesCronJob = async (MainInstance: Main) => {
  return CronBuilder.createAndRun('*/5 * * * * *', async () => {
    try {
      const userInfo = await User.findOne({ email: MainInstance.email });
      if (userInfo) {
        const items = await MainInstance.GetFavoritesInfos();

        var FavoriteStoreIds: mongoose.Types.ObjectId[] = [];
        if (userInfo.favoriteStores.length !== items.length) {

          for (let x = 0; x < items.length; x++) {
            let favoriteStore = await FavoriteStore.findOne({ item_id: items[x].item_id });
            if (favoriteStore)
              FavoriteStoreIds.push(favoriteStore._id);
            else {
              let newFavoriteStore = new FavoriteStore(items[x]);
              await newFavoriteStore.save();
              FavoriteStoreIds.push(newFavoriteStore._id);
            }
          }
        }

        for (const item of items) {
          const originalQuantity = await FavoriteStore.findOne(
            { item_id: item.item_id, store_id: item.store_id },
            { quantity: 1 }
          );

          if (originalQuantity && originalQuantity.quantity !== item.quantity) {
            if (item.quantity > 0) {
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
            }
            await FavoriteStore.findByIdAndUpdate(
              originalQuantity._id,
              { $set: { oldQuantity: originalQuantity.quantity } }
            );
            await FavoriteStore.findByIdAndUpdate(
              originalQuantity._id,
              item,
              { new: true }
            );
          }
          else if (!originalQuantity) {
            let newFavoriteStore = new FavoriteStore(item);
            await newFavoriteStore.save();
          }
        }

        if (userInfo.favoriteStores.length !== items.length) {
          // First, remove stores not in FavoriteStoreIds
          await User.updateMany({ email: MainInstance.email }, {
            $pull: { favoriteStores: { $nin: FavoriteStoreIds } }
          });

          // Then, add stores from FavoriteStoreIds
          await User.updateMany({ email: MainInstance.email }, {
            $addToSet: { favoriteStores: { $each: FavoriteStoreIds } }
          });
        }
      }
    } catch (err) {
      console.error('Error while running MainFavoritesCronJob:', err);
    }
  });
}
