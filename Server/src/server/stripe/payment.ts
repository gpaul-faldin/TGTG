import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

if (!process.env.STRIPE_PRIVATE) {
  throw new Error("Missing environment variables");
}

const stripe = new Stripe(process.env.STRIPE_PRIVATE, {
  apiVersion: '2023-08-16',
});


//const stripe = require('stripe')('sk_test_...');
const router = Router();

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_9d84caebbae62288627e4ddd705ec4b96a4f0c483ccbc51e652113c9a4547f53";

router.post('/webhook', async (Request, Response) => {
  const sig = Request.headers['stripe-signature'];

  if (!sig) {
    return Response.status(400).send(`Webhook Error: Missing stripe-signature`);
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(Request.body, sig, endpointSecret);
  } catch (err: any) {
    Response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object;
      console.log(`Checkout session completed:`, checkoutSessionCompleted);
      break;



    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      console.log(`Checkout session completed:`, paymentIntentSucceeded);
      break;


    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  Response.send();
});

export default router;