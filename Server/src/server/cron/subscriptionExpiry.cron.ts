import cron from 'node-cron';
import User, { UserDocument } from '@server/schema/Users.schema';
import { Subscription } from '@server/Enum/subscription';

export function startSubscriptionCronJob(): void {
  cron.schedule('0 0 * * *', async () => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate());

    const usersToUpdate: UserDocument[] = await User.find({
      subscription: { $ne: Subscription.FREE },
      subscriptionExpiry: { $lte: currentDate },
    });

    for (const user of usersToUpdate) {
      await User.updateOne({ _id: user._id }, { $set: { subscription: Subscription.FREE } });
    }
  });
}
