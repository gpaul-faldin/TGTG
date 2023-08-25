import { TGTG } from "./TgTg.class";
import { PaymentBuilder } from "./PaymentBuilder.class";

class Main extends TGTG{

  constructor(
    email: string,
    apkVersion: string,
    accessToken: string = '',
    refreshToken: string = '',
    userId: string = '',
    tokenAge: number = 0,
    cookie: string = '',
    ) {
    super(email, apkVersion, accessToken, refreshToken, userId, tokenAge, cookie);
  }

  /*UTILS*/

  private GetStoresInfo(items: any[]): any[] {

    var re: any[] = []

    for (let i = 0; i < items.length; i++) {
      re.push({
        name: items[i].display_name,
        quantity: items[i].items_available,
        store_id: items[i].store.store_id,
        item_id: items[i].item.item_id,
        in_sales_window: items[i].in_sales_window,
        price: items[i].item.price_excluding_taxes.minor_units / Math.pow(10, items[i].item.price_excluding_taxes.decimals),
      })
    }
    return re;
  }
  private FormatOrder(orderContainer: any): Object {
    return {
      orderId: orderContainer.order.id,
      quantity: orderContainer.order.order_line.quantity,
      price: orderContainer.order.order_line.item_price_including_taxes.minor_units / Math.pow(10, orderContainer.order.order_line.item_price_including_taxes.decimals),
      state: orderContainer.order.state,
    }
  }

  /*ENDPOINTS*/

  public async GetFavoritesInfos() {
    const items = await this.GetFavorites();
    const itemsInfo = this.GetStoresInfo(items);
    return itemsInfo;
  }
  public async CreateNewOrder(itemId: string, itemCount: number): Promise<any | null> {
    const order = await this.CreateOrder(itemId, itemCount);
    if (order.state === "SUCCESS") {
      const ret = this.FormatOrder(order);
      console.log("Order created");
      return ret;
    }
    return null;
  }
  public async GetStatus(orderId: string): Promise<string> {
    const order = await this.StatusOrder(orderId);
    return order.state;
  }
  public async AbortOrderID(orderId: string): Promise<boolean> {
    const order = await this.AbortOrder(orderId);
    return order.state;
  }
  public async PayOrder(orderId: string, payload: any): Promise<any> {
    const order = await this.Pay(orderId, payload);
    return order;
  }
  public async GetPaymentMethods(): Promise<any> {
    const paymentMethods = await this.FetchPaymentMethods();
    return paymentMethods;
  }
}

export {Main}