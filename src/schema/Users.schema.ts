import mongoose, { Document } from 'mongoose';
import {OrderDocument} from './order.schema';
import { FavoriteStoreDocument } from './favoriteStore.schema';
import { BuyOrderDocument } from './buyOrder.schema';

// Interface for User document
export interface UserDocument extends Document {
  isAdmin: boolean;
  active: boolean;
  email: string;
  subscription: string;
  paymentMethod: {
    cvc: string;
  };
  initInfo: {
    pollingId: string;
    apkVersion: string;
  };
  login: {
    accessToken: string;
    refreshToken: string;
    tokenAge: number;
    userId: string;
    cookie: string;
  };
  favoriteStores: FavoriteStoreDocument[];
  orderHistory: OrderDocument[];
  buyOrders: BuyOrderDocument[];
}

const UserSchema = new mongoose.Schema({
  isAdmin: { type: Boolean, default: false },
  active: Boolean,
  email: { type: String, required: true, unique: true },
  subscription: { type: String, default: 'free' },
  paymentMethod: {
    cvc: String
  },
  initInfo: {
    pollingId: { type: String, required: true },
    apkVersion: { type: String, required: true },
  },
  login: {
    accessToken: String,
    refreshToken: String,
    tokenAge: Number,
    userId: String,
    cookie: String,
  },
  favoriteStores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FavoriteStore',
    },
  ],
  orderHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ],
  buyOrders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BuyOrder',
    },
  ],
});

const User = mongoose.model<UserDocument>('User', UserSchema);

export default User;
