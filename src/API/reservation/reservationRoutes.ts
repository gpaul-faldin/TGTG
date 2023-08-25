import express from 'express';
import BuyOrder from '../../schema/buyOrder.schema';
import User from '../../schema/Users.schema';
import { startBuyOrderCron, removeBuyOrder } from '../../cron/buyOrder';

const router = express.Router();

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
      state: 'ONGOING',
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
  const userId = req.body.user;

  if (!buyOrderId || !userId) {
    return res.status(400).json({ message: 'Missing buyOrderId or userId.' });
  }

  try {
    const buyOrder = await BuyOrder.findById(buyOrderId);
    if (!buyOrder) {
      return res.status(404).json({ message: 'Buy Order not found.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.buyOrders.includes(buyOrder._id)) {
      buyOrder.state = 'CANCELED';
      await buyOrder.save();

      user.buyOrders = user.buyOrders.filter(id => id.toString() !== buyOrderId);
      await user.save();

      removeBuyOrder(buyOrderId);

      res.status(200).json({ message: 'BuyOrder removed successfully.' });
    } else {
      return res.status(403).json({ message: 'Unauthorized: Buy Order is not owned by this user.' });
    }
  } catch (err) {
    console.error('Error removing BuyOrder:', err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

export default router;
