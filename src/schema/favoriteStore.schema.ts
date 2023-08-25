import mongoose, { Document } from 'mongoose';

// Interface for FavoriteStore document
export interface FavoriteStoreDocument extends Document {
  name: string;
  quantity: number;
  store_id: string;
  item_id: string;
  in_sales_window: boolean;
  price: number;
  batchId: string;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteStoreSchema = new mongoose.Schema({
  name: String,
  quantity: { type: Number, required: true },
  store_id: String,
  item_id: String,
  in_sales_window: Boolean,
  price: Number,
  batchId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
  {
    timestamps: true,
  });

const FavoriteStore = mongoose.model<FavoriteStoreDocument>('FavoriteStore', FavoriteStoreSchema);

export default FavoriteStore;
