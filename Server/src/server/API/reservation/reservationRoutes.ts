import express from 'express';
import  jwt  from 'jsonwebtoken';
import BuyOrder from '@schema/buyOrder.schema';
import User from '@schema/Users.schema';
import { Main } from '@server/class/Main.class';
import { startBuyOrderCron, removeBuyOrder } from '@server/cron/buyOrder.cron';

const router = express.Router();

const schedule = {
  "FREE": "* */1 * * * *",
  "STARTER": "*/30 * * * * *",
  "PLUS": "*/15 * * * * *",
  "PRO": "*/5 * * * * *",
}

router.post('/create', async (req, res) => {
  const { item_id, quantity, store_id } = req.body;

  if (!item_id || !quantity || !store_id) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {

    const jwtInfo = jwt.verify(req.header('jwt') as string, process.env.JWT_SECRET as string) as {
      id: string;
      isAdmin: boolean;
      Subscription: string;
    }

    const user = await User.findById(jwtInfo.id);

    if (!user || !user.active) {
      return res.status(404).json({ message: 'User not found.' });
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

    var scheduleString = schedule[user.subscription]
    var main = new Main(
      user.email,
      user.initInfo.apkVersion,
      user.login.accessToken,
      user.login.refreshToken,
      user.login.userId,
      user.login.tokenAge,
      user.login.cookie
    )
    startBuyOrderCron(buyOrder._id.toString(), scheduleString, main);

    res.status(201).json({ message: 'BuyOrder created successfully.', buyOrder });
  } catch (err) {
    console.error('Error creating BuyOrder:', err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

router.delete('/remove/:id', async (req, res) => {
  const buyOrderId = req.params.id;

  if (!buyOrderId) {
    return res.status(400).json({ message: 'Missing buyOrderId or userId.' });
  }

  try {

    const jwtInfo = jwt.verify(req.header('jwt') as string, process.env.JWT_SECRET as string) as {
      id: string;
      isAdmin: boolean;
      Subscription: string;
    }

    const buyOrder = await BuyOrder.findById(buyOrderId);
    if (!buyOrder) {
      return res.status(404).json({ message: 'Buy Order not found.' });
    }

    const user = await User.findById(jwtInfo.id);
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

router.get('/', async (req, res) => {
  const jwtInfo = jwt.verify(req.header('jwt') as string, process.env.JWT_SECRET as string) as {
    id: string;
    isAdmin: boolean;
    Subscription: string;
  }

  const buyOrders = await BuyOrder.find({ user: jwtInfo.id });
  return res.status(200).json({ buyOrders });
});

export default router;
