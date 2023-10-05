import mongoose from "mongoose";
import { CronBuilder } from "@class/CronBuilder.class";
import { Main } from "@class/Main.class";
import FavoriteStore from "@schema/favoriteStore.schema";
import User from "@schema/Users.schema";

export const FavoritesCronJob = async (MainInstance: Main) => {
  return CronBuilder.createAndRun('*/1 * * * *', async () => {
    try {
      const userInfo = await User.findOne({ email: MainInstance.email }).populate('favoriteStores').exec();
      console.log(userInfo?.email)
      if (userInfo && userInfo?.favoriteStores.length > 0) {
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

export const BotCronJob = async (arrayOfInstances: Array<Main>) => {
  try {

    const numberOfJobs = arrayOfInstances.length;
    const minuteOffset = 60 / numberOfJobs;
    var seconds = 0;

    for (const user of arrayOfInstances) {
      if (seconds >= 60)
        seconds = 0;

      CronBuilder.createAndRun(`${seconds} */1 * * * *`, async () => {
        try {
          const userInfo = await User.findOne({ email: user.email }).populate('favoriteStores').exec();
          if (userInfo && userInfo?.favoriteStores.length > 0) {
            const items = await user.GetFavoritesInfos();

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
            await User.updateMany({ email: user.email }, {
              $pull: { favoriteStores: { $nin: newFavoriteStoreIds } }
            });

            // Then, add stores from newFavoriteStoreIds
            await User.updateMany({ email: user.email }, {
              $addToSet: { favoriteStores: { $each: newFavoriteStoreIds } }
            });
          }
        } catch (err) {
          console.error('Error while running MainFavoritesCronJob:', err);
        }
      });
      seconds += minuteOffset;
    }
  } catch (error) {
    console.error('Error in BotCronJob:', error);
  }
};

// export {FavoritesCronJob };
