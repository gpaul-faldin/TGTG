import { FavoriteStoreDocument } from "@server/schema/favoriteStore.schema";
import { sendEmailNotification } from "./email";

export const NotifHandler = (
  method: string,
  info: string,
  store: FavoriteStoreDocument
) => {
  if (method === "email") {
    sendEmailNotification(info, store);
  } else {
    console.log("Unknown notification method");
  }
};
