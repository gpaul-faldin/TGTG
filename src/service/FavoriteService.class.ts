import { Main } from '../class/Main.class';
import FavoriteStore from '../schema/favoriteStore.schema';

export class FavoriteService {
  private main: Main;

  constructor(main: Main) {
    this.main = main;
  }

  public async fetchAndStoreFavorites(): Promise<void> {
    try {
      const favorites = await this.main.GetFavoritesInfos();

      const batchId = new Date().toISOString();

      for (const favorite of favorites) {
        const { store_id, item_id, ...data } = favorite;

        await FavoriteStore.findOneAndUpdate(
          { store_id, item_id },
          {
            store_id,
            item_id,
            ...data,
            batchId,
            createdAt: new Date()
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      await FavoriteStore.deleteMany({ batchId: { $ne: batchId } });

    } catch (error) {
      console.error("Failed to fetch and store favorites:", error);
    }
  }
}