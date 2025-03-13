import mongoose, { Document } from 'mongoose';
import { UserDocument } from './Users.schema';

// Interface for BuyOrder document
export interface BuyOrderDocument extends Document {
  user: UserDocument;
  item_id: string;
  store_id: string;
  quantity: number;
  datePlaced?: Date;
  state: string;
}

const BuyOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  item_id: { type: String, required: true },
  store_id: String,
  quantity: { type: Number, required: true },
  state: String,
}, { timestamps: true });

const BuyOrder = mongoose.model<BuyOrderDocument>('BuyOrder', BuyOrderSchema);

export default BuyOrder;
