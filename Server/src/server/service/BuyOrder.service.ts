import { Main } from '@class/Main.class';
import { PaymentBuilder } from '@class/PaymentBuilder.class';
import User, { UserDocument } from '@schema/Users.schema';
import BuyOrder, { BuyOrderDocument } from '@schema/buyOrder.schema';
import Order from '@schema/order.schema';

export class BuyOrderService {

  private main: Main | null;
  private paymentBuilder: PaymentBuilder | null;
  private user: UserDocument | null;
  private buyOrder: BuyOrderDocument | null;
  private BuyorderId: string;
  private quantity: number;
  private preferredPaymentMethodId: string;

  constructor(orderId: string) {
    this.BuyorderId = orderId;
    this.quantity = 0;
    this.preferredPaymentMethodId = "";
    this.main = null;
    this.paymentBuilder = null;
    this.user = null;
    this.buyOrder = null;
  }

  public async init() {
    try {
      this.buyOrder = await BuyOrder.findById(this.BuyorderId).populate('user') as BuyOrderDocument;

      if (!this.buyOrder) {
        throw new Error(`Buy Order with ID ${this.BuyorderId} not found.`);
      }
      this.user = this.buyOrder.user as UserDocument;
      this.main = new Main(this.user.email, this.user.initInfo.apkVersion, this.user.login.accessToken, this.user.login.refreshToken, this.user.login.userId, this.user.login.tokenAge, this.user.login.cookie);

      const ItemInfo = await this.main.GetFavoriteInfos(this.buyOrder.item_id);
      this.quantity = ItemInfo[0].quantity;

      if (this.quantity > 0) {
        const quantity = this.buyOrder.quantity > this.quantity ? this.quantity : this.buyOrder.quantity;
        const orderId = await this.pushOrder(await this.main.CreateNewOrder(this.buyOrder.item_id, quantity));
        if (orderId === null) {
          throw new Error('Order not created.');
        }
        console.log(`Reserved ${quantity} of ${this.quantity}`);
      } else {
        throw new Error('Item is out of stock.');
      }

      console.log('Initialization complete.');
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private async pushOrder(order: any) {
    if (!this.buyOrder) {
      throw new Error('Run init first (Push Order)');
    }
    try {
      const NewOrder = new Order({
        orderId: order.orderId,
        buyOrder: this.buyOrder._id,
        shopName: order.shopName,
        quantity: order.quantity,
        price: order.price,
        state: order.state,
      });
      await NewOrder.save();
      return order.orderId;

    } catch (error) {
      console.error('Error in pay():', error);
      return null;
    }
  }

  private async UpdateOrderStatus(orderId: string) {
    if (!this.main || !this.paymentBuilder || !this.user || !this.buyOrder) {
      throw new Error('Run init first');
    }
    try {
      const status = await this.main.GetStatus(orderId);

      const order = await Order.findOne({ orderId: orderId });
      if (!order) {
        throw new Error('Order not found.');
      }
      order.state = status;
      await order.save();

      this.buyOrder.state = status;
      await this.buyOrder.save();
      const userWithUpdatedBuyOrders = await User.findByIdAndUpdate(
        this.user._id,
        {
          $pull: { buyOrders: this.buyOrder._id },
          $push: { orderHistory: order._id }
        },
        { new: true }
      );

      if (!userWithUpdatedBuyOrders) {
        throw new Error('Failed to update user.');
      }
      return this.buyOrder._id
    } catch (error) {
      console.error('UpdateOrderStatus():', error);
      return null
    }
  }

  private async pullStatus(PaymentId: string) {
    if (!this.main || !this.user || !this.buyOrder) {
      throw new Error('Run init first');
    }
    await this.sleep(1000);
    console.log(await this.main.GetPaymentStatus(PaymentId));
    await this.sleep(1000);
    console.log(await this.main.GetPaymentStatus(PaymentId));
    await this.sleep(5000);
    console.log(await this.main.GetPaymentBiometrics(PaymentId));
  }

  async pay(cvc: string = "") {

    if (!this.main || !this.user || !this.buyOrder) {
      throw new Error('Run init first');
    }
    try {
      if (this.user?.paymentMethod.cvc && this.user.isAdmin) {
        cvc = this.user.paymentMethod.cvc;
      }
      if (cvc === "") {
        throw new Error('CVC is missing.');
      }

      const order = await Order.findOne({ buyOrder: this.buyOrder._id });
      if (!order) {
        throw new Error('Order is missing.');
      }
      const orderId = order.orderId;


      this.preferredPaymentMethodId = await this.main.GetPaymentMethods();
      this.paymentBuilder = new PaymentBuilder(cvc, this.preferredPaymentMethodId);

      const PayInfo = await this.main.PayOrder(orderId, await this.paymentBuilder.buildCvCEncryptedObject());
      const PaymentId = PayInfo.payment_id;
      await this.pullStatus(PaymentId);
      await this.sleep(5000);
      return (await this.UpdateOrderStatus(orderId));
    } catch (error) {
      console.error('Error in pay():', error);
      return null;
    }
  }
}
