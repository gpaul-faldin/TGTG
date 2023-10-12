import cron from 'node-cron';
import BuyOrder from '@schema/buyOrder.schema';
import FavoriteStore from '@schema/favoriteStore.schema';
import { BuyOrderService } from '../service/BuyOrder.service';
import { sendSuccess } from '@notifications/discordWebhook';

const buyOrderCronMap = new Map<string, cron.ScheduledTask>();

const schedule = {
  "FREE": "* */1 * * * *",
  "STARTER": "*/30 * * * * *",
  "PLUS": "*/15 * * * * *",
  "PRO": "*/5 * * * * *",
}

const startBuyOrderCron = (buyOrderId: string, schedule: string) => {
  const cronJob = cron.schedule(schedule, async () => {
    try {
      const buyOrder = await BuyOrder.findOne({_id: buyOrderId, state: 'ONGOING'});

      if (!buyOrder) {
        console.error(`Buy Order with ID ${buyOrderId} is already running`);
        return;
      }

      const { item_id } = buyOrder;

      const favoriteStore = await FavoriteStore.findOne({ item_id });

      if (!favoriteStore) {
        console.error(`Favorite Store with item_id ${item_id} not found.`);
        return;
      }

      if (buyOrder.quantity <= favoriteStore.quantity) {
        await BuyOrder.findByIdAndUpdate(buyOrderId, { state: 'APPROVED' });
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
    const ongoingBuyOrders = await BuyOrder.find({ state: 'ONGOING' }).populate('user');

    let startedCount = 0;

    for (const buyOrder of ongoingBuyOrders) {
      var scheduleString = schedule[buyOrder.user.subscription]
      startBuyOrderCron(buyOrder._id.toString(), scheduleString);
      startedCount++;
    }

    console.log(`${startedCount} cron jobs started for ongoing buy orders`);
  } catch (error) {
    console.error('Error starting cron jobs for ongoing buy orders:', error);
    return 0; // Return 0 on error
  }
};

export { startBuyOrderCron, removeBuyOrder, startCronJobsForOngoingBuyOrders }