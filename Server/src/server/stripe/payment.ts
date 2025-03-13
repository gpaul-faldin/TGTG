import { Router, raw, Request, Response } from 'express';
import { UserService } from '@server/service/User.service';
import { Subscription } from '@server/Enum/subscription';
import Stripe from 'stripe';

if (!process.env.STRIPE_PRIVATE) {
  throw new Error("Missing environment variables");
}

const stripe = new Stripe(process.env.STRIPE_PRIVATE, {
  apiVersion: '2023-08-16',
});

const router = Router();
const endpointSecret = "whsec_9d84caebbae62288627e4ddd705ec4b96a4f0c483ccbc51e652113c9a4547f53";

router.post('/webhook', raw({ type: "application/json" }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send(`Webhook Error: Missing stripe-signature`);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }



  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object as Stripe.Checkout.Session;
      if (checkoutSessionCompleted.payment_status === "paid" && checkoutSessionCompleted.status === "complete") {
        if (checkoutSessionCompleted.customer_details?.email) {
          const userService = new UserService(checkoutSessionCompleted.customer_details?.email);
          const subscription = checkoutSessionCompleted.metadata?.subscription;
          if (subscription)
            await userService.updateUserSubscription(subscription as Subscription);
          console.log("Payment COMPLETED")
        }
      }
      break;
    default:
      break;
  }

  res.send("OK");
});

export default router;
