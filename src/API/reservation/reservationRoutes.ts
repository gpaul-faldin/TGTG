import express from 'express';
import cron from 'node-cron';
import BuyOrder from '../../schema/buyOrder.schema';
import User from '../../schema/Users.schema';
import FavoriteStore from '../../schema/favoriteStore.schema';
import { BuyOrderService } from '../../service/BuyOrder.service';

const router = express.Router();

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

      if (favoriteStore.quantity <= buyOrder.quantity) {
        console.log(`buying ${favoriteStore.quantity} of ${buyOrder.quantity}`);
        const buyOrderService = new BuyOrderService(buyOrder._id.toString(), favoriteStore.quantity);
        await buyOrderService.init();
        if (await buyOrderService.pay() === null){
          //SEND EMAIL WITH LINK TO ENTER CVV
          removeBuyOrder(buyOrder._id.toString())
          return;
        }
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


router.post('/create', async (req, res) => {
  const { userId, item_id, quantity, store_id } = req.body;

  if (!userId || !item_id || !quantity || !store_id) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const user = await User.findById(userId);

    if (!user || !user.active) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.subscription !== 'premium' && user.isAdmin === false) {
      return res.status(403).json({ message: 'User is not premium.' });
    }

    const buyOrder = new BuyOrder({
      user: user._id,
      item_id: item_id,
      store_id: store_id,
      quantity: quantity,
      datePlaced: new Date().toISOString(),
      state: 'pending',
    });

    await buyOrder.save();

    user.buyOrders.push(buyOrder._id);
    await user.save();

    startBuyOrderCron(buyOrder._id.toString());

    res.status(201).json({ message: 'BuyOrder created successfully.', buyOrder });
  } catch (err) {
    console.error('Error creating BuyOrder:', err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

router.delete('/remove/:id', async (req, res) => {
  const buyOrderId = req.params.id;

  if (!buyOrderId) {
    return res.status(400).json({ message: 'Missing buyOrderId.' });
  }

  try {
    const buyOrder = await BuyOrder.findById(buyOrderId);
    if (!buyOrder) {
      return res.status(404).json({ message: 'Buy Order not found.' });
    }

    const user = await User.findById(buyOrder.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.buyOrders = user.buyOrders.filter(id => id.toString() !== buyOrderId);
    await user.save();

    await removeBuyOrder(buyOrderId);

    res.status(200).json({ message: 'BuyOrder removed successfully.' });
  } catch (err) {
    console.error('Error removing BuyOrder:', err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

export default router;
