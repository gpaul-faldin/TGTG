import mongoose, { Document } from 'mongoose';
import { FavoriteStoreDocument } from './favoriteStore.schema';

// Interface for Notifications document
export interface NotificationsDocument extends Document {
  subscriptionStatus: {
    FREE: boolean,
    STARTER: boolean,
    PLUS: boolean,
    PRO: boolean,
  },
  favoriteStores: FavoriteStoreDocument,
  state: string,
}

const NotificationsSchema = new mongoose.Schema({
  subscriptionStatus: {
    FREE: { type: Boolean, default: false },
    STARTER: { type: Boolean, default: false },
    PLUS: { type: Boolean, default: false },
    PRO: { type: Boolean, default: false },
  },
  favoriteStores: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FavoriteStore'
  },
  state: { type: String, default: "inactive" }

});

const Notifications = mongoose.model<NotificationsDocument>('Notifications', NotificationsSchema);

export default Notifications;
