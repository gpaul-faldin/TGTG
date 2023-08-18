// index.ts
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import { Main } from './class/Main.class';
import { getApkVersion } from './utils/getApkVersion';
import orderRoutes from './API/order/orderRoutes';
import favoritesRoutes from './API/favorites/favoritesRoutes';
//import reservationRoutes from './API/reservation/reservationRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const Email = process.env.EMAIL;
const Password = process.env.PASSB64;

if (!Email || !Password) {
  throw new Error("Missing environment variables");
}

(async () => {
  try {
    const apkVersion = await getApkVersion();
    const main = new Main(Email, Password, 'outlook.office365.com', apkVersion);
    await main.init();
    console.log("Logged in");

    app.use((req: Request, res: Response, next: NextFunction) => {
      (req as any).main = main;
      next();
    });

    app.use('/api/order', orderRoutes);
    app.use('/api/favorites', favoritesRoutes);
    //app.use('/api/reservation', reservationRoutes);

    app.listen(port, () => {
      console.log(`Server up on port: ${port}`);
    });

  } catch (error) {
    console.error('An error occurred during initialization:', error);
  }
})();


// (async () => {

//   if (!process.env.EMAIL || !process.env.PASSB64)
//     throw new Error("Missing environment variables");

//   const Email = process.env.EMAIL
//   const Password = process.env.PASSB64


//   try {

//     const apkVersion = await getApkVersion();

//     const main = new Main(Email, Password, 'outlook.office365.com', apkVersion);
//     await main.init();
//     console.log("Logged in")
//     const items = await main.GetFavoritesInfos();

//     fs.writeFileSync('items.json', JSON.stringify(items[0], null, 2));
//     fs.writeFileSync('full.json', JSON.stringify(items[1], null, 2));

//     const order = await main.CreateNewOrder("626779", 1);
//     if (order) {
//       fs.writeFileSync('order.json', JSON.stringify(order, null, 2));
//       const orderStatus = await main.GetStatus(order.orderId);
//       console.log(orderStatus);
//       const abort = await main.AbortOrderID(order.orderId);
//       console.log(abort)
//     }

//   } catch (error) {
//     // Handle errors that occurred during initialization
//     console.error('An error occurred during initialization:', error);
//   }
// })();

