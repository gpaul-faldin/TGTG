import { Router, Request, Response } from 'express';
import FavoriteStore from '../../schema/favoriteStore.schema';

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

    const favoritesFromAPI = await req.main.GetFavoritesInfos();
    await FavoriteStore.deleteMany({});
    await FavoriteStore.insertMany(favoritesFromAPI);

    return res.status(200).json(favoritesFromAPI);

  } catch (err) {
    console.error('Failed to retrieve favorites:', err);
    res.status(500).json({ message: 'Failed to retrieve favorites' });
  }
});

export default router;
