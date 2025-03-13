import mongoose, { Document } from 'mongoose';
import { BuyOrderDocument } from './buyOrder.schema';

// Interface for Order document
export interface OrderDocument extends Document {
  orderId: string;
  buyOrder: BuyOrderDocument;
  shopName: string;
  quantity: number;
  price: number;
  state: string;
}

const OrderSchema = new mongoose.Schema({
  orderId: String,
  buyOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BuyOrder',
    required: true,
  },
  shopName: String,
  quantity: Number,
  price: Number,
  state: String,
}, { timestamps: true });

const Order = mongoose.model<OrderDocument>('Order', OrderSchema);

export default Order;
