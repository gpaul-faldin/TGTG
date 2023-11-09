import User, { UserDocument } from '@schema/Users.schema';
import { Subscription } from '@server/Enum/subscription';

export class UserService {

  private userId: string | null;

  constructor(userEmail: string) {
    this.userId = "";
    this.initializeUserId(userEmail);
  }

  /*
    INITIALIZATION
  */

  private async initializeUserId(userEmail: string) {
    const userExists: UserDocument | null = await User.findOne({ email: userEmail });
    if (userExists) {
      this.userId = userExists._id;
    } else {
      this.userId = null;
    }
  }
  private async waitForUserId() {
    while (this.userId === "") {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (this.userId === null) {
      throw new Error("User not found");
    }
  }

  /*
    UTILS
  */

  private async extendSubscriptionExpiry (daysToAdd: number): Promise<Date> {

    const user = await User.findOne({ _id: this.userId });

    if (user?.subscriptionExpiry)
      var currentExpiry = new Date(user?.subscriptionExpiry);
    else
      var currentExpiry = new Date();

    currentExpiry.setDate(currentExpiry.getDate() + daysToAdd);
    return currentExpiry;
  }

  /*
    PUBLIC METHODS
  */

  public async updateUserInfo(update: any) {
    await this.waitForUserId();
    // Implementation for updating user info
  }
  public async updateUserSubscription(subscription: Subscription) {
    await this.waitForUserId();
    try {
      console.log("Updating subscription to:", subscription);
      const newExpiryDate = this.extendSubscriptionExpiry(32);

      await User.updateOne({ _id: this.userId }, {
        $set: {
          subscription: subscription,
          subscriptionExpiry: newExpiryDate,
        },
      });

    } catch (err) {
      throw new Error("Error updating user subscription");
    }
  }
  public async extendUserSubscription(daysToAdd: number) {
    await this.waitForUserId();
    try {

      const newExpiryDate = this.extendSubscriptionExpiry(daysToAdd);

      await User.updateOne({ _id: this.userId }, {
        $set: {
          subscriptionExpiry: newExpiryDate,
        },
      });

      console.log("Subscription extended to:", newExpiryDate);
    } catch (err) {
      throw new Error("Error extending user subscription");
    }
  }
}
