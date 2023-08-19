import mongoose from 'mongoose';

const FavoriteStoreSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  store_id: String,
  item_id: String,
  in_sales_window: Boolean,
  price: Number,
  batchId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FavoriteStore = mongoose.model('FavoriteStore', FavoriteStoreSchema);

export default FavoriteStore;
