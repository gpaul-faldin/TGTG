import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  orderId: String,
  shopName: String,
  quantity: Number,
  price: Number,
  state: String,
});

const User = mongoose.model('User', UserSchema);

export default User;