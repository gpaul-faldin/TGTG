// import { Router, Request, Response } from 'express';
// import FavoriteStore from '../../schema/favoriteStore.schema';

// const router = Router();
// const dataExpiryMinutes = 5;

// router.get('/', async (req: Request, res: Response) => {
//   try {
//     const favoriteService = new FavoriteService(req.main);
//     await favoriteService.fetchAndStoreFavorites();

//     const newFreshFavorites = await FavoriteStore.find();
//     return res.status(200).json(newFreshFavorites);

//   } catch (err) {
//     console.error('Failed to retrieve favorites:', err);
//     res.status(500).json({ message: 'Failed to retrieve favorites' });
//   }
// });

// export default router;
