import express from 'express';
import jwt from 'jsonwebtoken';
import User from '@schema/Users.schema';

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.header('jwt')) {
    return res.status(400).json({ message: 'Missing jwt' });
  }
  const jwtInfo = jwt.verify(req.header('jwt') as string, process.env.JWT_SECRET as string) as {
    id: string;
    isAdmin: boolean;
    Subscription: string;
  }

  try {
    const user = await User.findById(jwtInfo.id).populate('favoriteStores');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favoriteStoresData = user.favoriteStores;
    return res.status(200).json({ status: 'OK', data: favoriteStoresData, message: "favoriteStores retrieved successfully"});
  } catch (error: any) {
    console.error(`Error retrieving user: ${error.message}`);
    return res.status(500).json({ status: "KO", message: 'Internal server error' });
  }
});

export default router;