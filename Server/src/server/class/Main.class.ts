import { TGTG } from "./TgTg.class";

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

  /*
    UTILS
  */

  private GetStoresInfo(items: any[]): any[] {

    var re: any[] = []

    for (let i = 0; i < items.length; i++) {
      re.push({
        name: items[i].display_name,
        quantity: items[i].items_available,
        store_id: items[i].store.store_id,
        item_id: items[i].item.item_id,
        in_sales_window: items[i].in_sales_window,
        info: {
          logoPicture: items[i].store.logo_picture.current_url,
          address: items[i].store.store_location.address.address_line
        },
        price: items[i].item.price_excluding_taxes.minor_units / Math.pow(10, items[i].item.price_excluding_taxes.decimals),
      })
    }
    return re;
  }
  private FormatOrder(orderContainer: any): Object {
    return {
      orderId: orderContainer.order.id,
      quantity: orderContainer.order.order_line.quantity,
      price: (orderContainer.order.order_line.item_price_including_taxes.minor_units / Math.pow(10, orderContainer.order.order_line.item_price_including_taxes.decimals)) * orderContainer.order.order_line.quantity,
      state: orderContainer.order.state,
    }
  }

  /*
    ENDPOINTS
  */

  public async GetFavoritesInfos() {
    const items: Array<any> = [];
    var loop: boolean = true;
    var page: number = 0;

    while (loop === true && page < 3) {
      const itemsContainer = await this.GetFavorites(page);
      items.push(...itemsContainer);
      if (itemsContainer.length !== 50) {
        loop = false;
      } else {
        page += 1;
      }
    }

    const itemsInfo = this.GetStoresInfo(items);
    await this.UpdateUser()
    return itemsInfo;
  }
  public async GetFavoriteInfos(itemId: string) {
    const item = await this.GetFavorite(itemId);
    const itemInfo = this.GetStoresInfo([item]);
    return itemInfo;
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
  public async GetPaymentStatus(PaymentId: string): Promise<string> {
    const paymentStatus = await this.PaymentStatus(PaymentId);
    return paymentStatus;
  }
  public async GetPaymentBiometrics(PaymentId: string): Promise<any> {
    const paymentBiometrics = await this.PaymentBiometrics(PaymentId);
    return paymentBiometrics;
  }
}

export {Main}