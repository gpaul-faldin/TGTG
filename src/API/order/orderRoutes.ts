import { Router, Request, Response } from 'express';
import Order from '../../schema/order.schema';
import FavoriteStore from '../../schema/favoriteStore.schema';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
  const itemId = req.body.itemId;
  const quantity = req.body.quantity;

  if (!itemId || !quantity) {
    return res.status(400).json({
      message: "Missing itemId or quantity"
    });
  }

  try {
    // Step 1: Fetch the shop name from the MongoDB collection of favorite stores
    const favoriteStore = await FavoriteStore.findOne({ item_id: itemId });

    if (!favoriteStore) {
      return res.status(404).json({
        message: "Shop with provided itemId not found"
      });
    }

    // Step 2: Create the order through your Main class method
    const OrderInfo = await req.main.CreateNewOrder(itemId, quantity);

    // Step 3: Save the order details along with the shop name in MongoDB
    const newOrder = new Order({
      orderId: OrderInfo.orderId,
      quantity: OrderInfo.quantity,
      price: OrderInfo.price,
      state: OrderInfo.state,
      shopName: favoriteStore.name, // Add the shop name here
    });

    await newOrder.save();

    res.status(200).json(newOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/abort/:orderId', async (req: Request, res: Response) => {
  try {
    // Step 1: Abort the order through your Main class method
    const abort = await req.main.AbortOrderID(req.params.orderId);

    if (abort) {
      // Step 2: Remove the corresponding order from MongoDB
      await Order.deleteOne({ orderId: req.params.orderId });

      // Step 3: Send a success response
      res.status(200).json({ message: 'Order aborted successfully', data: abort });
    } else {
      // Step 4: Send a not found error if the order couldn’t be aborted
      res.status(404).json({ message: "Order not found or couldn't be aborted" });
    }

  } catch (err) {
    // Handle any errors that occurred during the process
    console.error('Failed to abort order:', err);
    res.status(500).json({ message: 'Failed to abort order' });
  }
});

export default router;