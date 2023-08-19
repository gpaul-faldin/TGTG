import { Router, Request, Response } from 'express';
import FavoriteStore from '../../schema/favoriteStore.schema';
import { FavoriteService } from '../../service/FavoriteService.class';

const router = Router();
const dataExpiryMinutes = 5;

router.get('/', async (req: Request, res: Response) => {
  try {
    const latestFavorite = await FavoriteStore.findOne().sort('-createdAt');

    if (latestFavorite) {
      const dataAgeMinutes = (new Date().getTime() - new Date(latestFavorite.createdAt).getTime()) / (1000 * 60);

      if (dataAgeMinutes < dataExpiryMinutes) {
        const favorites = await FavoriteStore.find();
        return res.status(200).json(favorites);
      }
    }

    const favoriteService = new FavoriteService(req.main);
    await favoriteService.fetchAndStoreFavorites();

    const newFreshFavorites = await FavoriteStore.find();
    return res.status(200).json(newFreshFavorites);

  } catch (err) {
    console.error('Failed to retrieve favorites:', err);
    res.status(500).json({ message: 'Failed to retrieve favorites' });
  }
});

export default router;
