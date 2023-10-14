import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const verifySubscription = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('jwt');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      isAdmin: boolean;
      Subscription: string;
    }
    if (req.baseUrl === "/api/reservation" && decoded.Subscription === "FREE" && decoded.isAdmin === false) {
      return res.status(403).json({ message: 'User is not premium.' });
    }
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export default verifySubscription;
