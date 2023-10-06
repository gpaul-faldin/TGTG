import mongoose, { Document } from 'mongoose';

// Interface for FavoriteStore document
export interface FavoriteStoreDocument extends Document {
  name: string;
  quantity: number;
  oldQuantity: number;
  info: {
    logoPicture: string;
    address: string;
  };
  store_id: string;
  item_id: string;
  in_sales_window: boolean;
  price: number;
}

const FavoriteStoreSchema = new mongoose.Schema({
  name: String,
  quantity: { type: Number, required: true },
  oldQuantity: { type: Number, required: true, default: 0 },
  info: {
    logoPicture: String,
    address: String
  },
  store_id: String,
  item_id: String,
  in_sales_window: Boolean,
  price: Number,
},
  {
    timestamps: true,
  });

const FavoriteStore = mongoose.model<FavoriteStoreDocument>('FavoriteStore', FavoriteStoreSchema);

export default FavoriteStore;
