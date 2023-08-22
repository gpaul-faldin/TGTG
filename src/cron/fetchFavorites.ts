import * as cron from 'node-cron';
import { Main } from '../class/Main.class';
import { FavoriteService } from '../service/FavoriteService.class';

// Set up a Cron job that runs every 3 minutes
const task = cron.schedule('*/1 * * * *', async () => {
  const mainInstanceInit = Main.isInitialized()

  if (mainInstanceInit === false) {
    console.error("Main class needs to be initialized to fetch and store favorites");
  } else {
    const mainInstance = Main.getInstance();
    const favoriteService = new FavoriteService(mainInstance);

    await favoriteService.fetchAndStoreFavorites();
  }
});


//task.start();