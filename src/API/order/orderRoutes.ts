import { Router, Request, Response } from 'express';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
  const itemId = req.body.itemId;
  const quantity = req.body.quantity;

  if (!itemId || !quantity) {
    return res.status(400).json({
      message: "Missing itemId or quantity"
    });
  }
  const order = await req.main.CreateNewOrder(itemId, quantity);
  res.status(200).json(order);
});

router.post('/abort/:orderId', async (req: Request, res: Response) => {
  const abort = await req.main.AbortOrderID(req.params.orderId);
  res.status(200).json(abort);
});

export default router;