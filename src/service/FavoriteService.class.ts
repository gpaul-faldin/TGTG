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

      await FavoriteStore.deleteMany({});
      await FavoriteStore.insertMany(favorites);
    } catch (error) {
      console.error("Failed to fetch and store favorites:", error);
    }
  }
}
