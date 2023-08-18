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

    fs.writeFileSync('items.json', JSON.stringify(items, null, 2));

    // console.log(main.userId)


  } catch (error) {
    // Handle errors that occurred during initialization
    console.error('An error occurred during initialization:', error);
  }
})();
