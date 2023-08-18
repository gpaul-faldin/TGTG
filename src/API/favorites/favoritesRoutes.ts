import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const favorites = await req.main.GetFavoritesInfos();
  res.status(200).json(favorites);
});

export default router;
