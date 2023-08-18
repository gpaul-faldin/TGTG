// index.ts
import dotenv from 'dotenv';
import { Main } from './class/Main.class';
import { getApkVersion } from './utils/getApkVersion';

import fs from 'fs';

dotenv.config();

(async () => {

  if (!process.env.EMAIL || !process.env.PASSB64)
    throw new Error("Missing environment variables");

  const Email = process.env.EMAIL
  const Password = process.env.PASSB64


  try {

    const apkVersion = await getApkVersion();

    const main = new Main(Email, Password, 'outlook.office365.com', apkVersion);
    await main.init();
    console.log("Logged in")
    const items = await main.GetFavoritesInfos();

    fs.writeFileSync('items.json', JSON.stringify(items[0], null, 2));
    fs.writeFileSync('full.json', JSON.stringify(items[1], null, 2));

    const order = await main.CreateNewOrder("626779", 1);
    if (order) {
      fs.writeFileSync('order.json', JSON.stringify(order, null, 2));
      const orderStatus = await main.GetStatus(order.orderId);
      console.log(orderStatus);
      const abort = await main.AbortOrderID(order.orderId);
      console.log(abort)
    }

    // console.log(main.userId)


  } catch (error) {
    // Handle errors that occurred during initialization
    console.error('An error occurred during initialization:', error);
  }
})();
