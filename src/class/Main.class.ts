import { PuppeteerExtraBot } from "./Puppeteer.class";
import { RetrieveLink } from "./RetrieveLink.class";
import { TGTG } from "./TgTg.class";
import { base64ToText } from "../utils/base64ToText";

class Main extends TGTG{

  private RetrieveLink: RetrieveLink;
  private Bot: PuppeteerExtraBot;

  private static instance: Main | null = null;
  private static email: string;
  private static PasswordB64: string;
  private static host: string;
  private static apkVersion: string;

  private constructor(email: string, PasswordB64: string, host: string, apkVersion: string) {
    super(email, apkVersion);
    this.RetrieveLink = new RetrieveLink(email, base64ToText(PasswordB64), host, /https:\/\/share\.toogoodtogo\.com\/login\/accept\/[a-zA-Z0-9/-]+/g);
    this.Bot = new PuppeteerExtraBot('', { headless: "new" });
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
      quantity: orderContainer.order.quantity,
      price: orderContainer.order.order_line.item_price_including_taxes.minor_units / Math.pow(10, orderContainer.order.order_line.item_price_including_taxes.decimals),
      state: orderContainer.order.state,
    }
  }

  /*INIT*/

  public static initialize(email: string, PasswordB64: string, host: string, apkVersion: string): void {
    Main.email = email;
    Main.PasswordB64 = PasswordB64;
    Main.host = host;
    Main.apkVersion = apkVersion;
  }
  public static isInitialized(): boolean {
    return this.instance !== null;
  }
  public static getInstance(): Main {
    if (Main.instance === null) {
      if (Main.email && Main.PasswordB64 && Main.host && Main.apkVersion) {
        Main.instance = new Main(Main.email, Main.PasswordB64, Main.host, Main.apkVersion);
      } else {
        throw new Error("Main class needs to be initialized before getting an instance");
      }
    }

    return Main.instance;
  }
  public async init() {
    const pollingId = await this.Login()
    if (pollingId) {
      const link = await this.RetrieveLink.LoopRetrieveLoginLink(5);
      if (!link)
        throw new Error("No link found");
      this.Bot.pageUrl = link;
      if (link) {
        await this.Bot.waitForXPathOutcome('//span[text()="You’re logged in"]', '//span[text()="Something went wrong"]', 15000);
      }
      const retPolling = await this.Polling(pollingId)
      if (retPolling === "Error")
        throw new Error("Connection failed failed");
      else if (retPolling === "Success")
        console.log("Connection successful");
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
}

export {Main}