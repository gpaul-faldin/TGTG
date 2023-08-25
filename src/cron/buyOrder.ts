import cron from 'node-cron';
import BuyOrder from '../schema/buyOrder.schema';
import FavoriteStore from '../schema/favoriteStore.schema';
import { BuyOrderService } from '../service/BuyOrder.service';
import { sendSuccess } from '../notifications/discordWebhook';

const buyOrderCronMap = new Map<string, cron.ScheduledTask>();

const startBuyOrderCron = (buyOrderId: string) => {
  const cronJob = cron.schedule("*/30 * * * * *", async () => {
    try {
      const buyOrder = await BuyOrder.findById(buyOrderId);

      if (!buyOrder) {
        console.error(`Buy Order with ID ${buyOrderId} not found.`);
        return;
      }

      const { item_id } = buyOrder;

      const favoriteStore = await FavoriteStore.findOne({ item_id });

      if (!favoriteStore) {
        console.error(`Favorite Store with item_id ${item_id} not found.`);
        return;
      }

      if (buyOrder.quantity <= favoriteStore.quantity) {
        const buyOrderService = new BuyOrderService(buyOrder._id.toString());
        await buyOrderService.init();
        const paySuccess = await buyOrderService.pay()
        if (paySuccess === null) {
          //SEND EMAIL WITH LINK TO ENTER CVV
          console.log("SEND EMAIL WITH LINK TO ENTER CVV")
        }
        await sendSuccess(`Buy Order ${buyOrder._id.toString()} completed.`)
        removeBuyOrder(buyOrder._id.toString())
        return;
      }

    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });

  buyOrderCronMap.set(buyOrderId, cronJob);
};

const removeBuyOrder = async (buyOrderId: string) => {
  const cronJob = buyOrderCronMap.get(buyOrderId);
  if (cronJob) {
    cronJob.stop();
    buyOrderCronMap.delete(buyOrderId);
    console.log(`Cron job for Buy Order ${buyOrderId} removed.`);
  }

  await BuyOrder.deleteOne({ _id: buyOrderId });
};

const startCronJobsForOngoingBuyOrders = async () => {
  try {
    const ongoingBuyOrders = await BuyOrder.find({ state: 'ONGOING' });

    let startedCount = 0; // To keep track of the number of started buy orders

    for (const buyOrder of ongoingBuyOrders) {
      startBuyOrderCron(buyOrder._id.toString());
      startedCount++;
    }

    console.log(`${startedCount} cron jobs started for ongoing buy orders`);
  } catch (error) {
    console.error('Error starting cron jobs for ongoing buy orders:', error);
    return 0; // Return 0 on error
  }
};

export { startBuyOrderCron, removeBuyOrder, startCronJobsForOngoingBuyOrders }