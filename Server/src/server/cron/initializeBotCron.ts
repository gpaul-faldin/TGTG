import User from '@schema/Users.schema';
import { Main } from '@class/Main.class';
import { BotCronJob} from '@utils/CronJobFavoritesBuilder';

export const initializeBotCron = async () => {
  try {
    const userCursor = User.find({
      active: true,
      email: {
          $regex: /\btoogoodtobot\.notifications\b/,
      }
    }).cursor();
    const arrayOfInstances: Array<Main> = []


    for await (const user of userCursor) {
      if (user.login && user.initInfo) {
        arrayOfInstances.push(new Main(
          user.email,
          user.initInfo.apkVersion,
          user.login.accessToken,
          user.login.refreshToken,
          user.login.userId,
          user.login.tokenAge,
          user.login.cookie
        ));
      }
    }
    BotCronJob(arrayOfInstances);
  } catch (error) {
    console.error('Error initializing user cron jobs:', error);
  }
};