import Stripe from "stripe";
// models
import { Coupon } from "../../DB/Models/index.js";
// utils
import { couponType } from "../Utils/index.js";

export const createCheckoutSession = async ({
  customer_email,
  metadata,
  discounts,
  line_items
}) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const paymentDate = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: 'payment',
    customer_email,
    metadata,
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
    discounts,
    line_items 
  })

  return paymentDate
}

export const createStripeCoupon = async ({couponId}) => {

  const findCoupon = await Coupon.findById(couponId);

  if (!findCoupon) {
    return new Error("Coupon not found", 404, "Coupon not found");
  }

  let couponObject = {}

  if (findCoupon.couponType == couponType.AMOUNT) {
    couponObject = {
      name: findCoupon.couponCode,
      amount_off: findCoupon.couponAmount * 100,
      currency: "egp"
    }
  }
  if (findCoupon.couponType == couponType.PERCENTAGE) {
    couponObject = {
      name: findCoupon.couponCode,
      percent_off: findCoupon.couponAmount
    }
  }

  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const StripeCoupon = await stripe.coupons.create(couponObject);

  return StripeCoupon 
}

export const createPaymentMethod = async ({ token }) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      token
    }
  })

  return paymentMethod
}

export const createIntent = async ({ amount, currency }) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const paymentMethods = await createPaymentMethod({ token: "tok_visa" });
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never"
    },
    payment_method: paymentMethods.id
  })

  return paymentIntent
}

export const retrivePaymentIntent = async ({ paymentIntentId }) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return paymentIntent
}

export const confirm = async ({ paymentIntentId }) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const paymentDetails = await retrivePaymentIntent({ paymentIntentId });

  const confirmPayment = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentDetails.payment_method
  })

  return confirmPayment
}

export const refundPayment = async ({ paymentIntentId }) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId
  })  

  return refund
}