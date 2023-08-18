import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: String,
  shopName: String,
  quantity: Number,
  price: Number,
  state: String,
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;