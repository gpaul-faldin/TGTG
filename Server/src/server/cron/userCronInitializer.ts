import User from '@schema/Users.schema';
import { Main } from '@class/Main.class';
import { FavoritesCronJob } from '@utils/CronJobFavoritesBuilder';

export const initializeUserCronJobs = async () => {
  try {
    const userCursor = User.find({
      active: true,
      email: {
        $not: {
          $regex: /\btoogoodtobot\.notifications\b/,
        }
      }
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