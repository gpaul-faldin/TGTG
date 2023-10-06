import User from '@schema/Users.schema';
import { Main } from '@class/Main.class';
import { FavoritesCronJob } from '@utils/CronJobFavoritesBuilder';

export const FavoriteScanCronInitializer = async () => {

  const schedule = {
    "FREE": "* */1 * * * *",
    "STARTER": "*/30 * * * * *",
    "PLUS": "*/15 * * * * *",
    "PRO": "*/5 * * * * *",
  }

  try {
    const userCursor = User.find({
      active: true,
    }).cursor();

    for await (const user of userCursor) {
      if (user.login && user.initInfo) {
        const mainInstance = new Main(
          user.email,
          user.initInfo.apkVersion,
          user.login.accessToken,
          user.login.refreshToken,
          user.login.userId,
          user.login.tokenAge,
          user.login.cookie
        );

        FavoritesCronJob(mainInstance);
      }
    }
  } catch (error) {
    console.error('Error initializing user cron jobs:', error);
  }
};