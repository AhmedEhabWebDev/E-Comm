import { DateTime } from "luxon";

// Utils
import { ErrorClass, OrderStatus, PaymentMethods } from "../../Utils/index.js";
import { calculateCartTotal } from "../Cart/Utils/cart.utils.js";
import { applyCoupon, valdeateCoupon } from "./Utils/order.utils.js";

// models
import { 
  Address, 
  Cart, 
  Order, 
  Product 
} from "../../../DB/Models/index.js";

// paymentStripe
import { 
  confirm, 
  createCheckoutSession, 
  createIntent, 
  createStripeCoupon, 
  refundPayment 
} from "../../Payment-handler/stripe.js";

/**
 * @api {POST} /orders/create    Create order
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns {status: string, message: string, data: object}
 */

export const createOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const {
    address,
    addressId,
    contactNumber,
    couponCode,
    shippingFee,
    VAT,
    paymentMethod,
  } = req.body;

  // find logged in user cart with product
  const cart = await Cart.findOne({ userId }).populate("products.productId");
  if (!cart || !cart.products.length) {
    return next(new ErrorClass("Cart is Empty", 400, "Cart is Empty"));
  }

  // check if any product in cart is out of stock
  const isSoldOut = cart.products.find((p) => p.productId.stoke < p.quantity);
  if (isSoldOut) {
    return next(
      new ErrorClass(
        `Product ${isSoldOut.productId.title} is out of stock`,
        400,
        "Product is out of stock"
      )
    );
  }

  const subTotal = calculateCartTotal(cart.products);
  let total = shippingFee + VAT + subTotal;

  let coupon = null;
  if (couponCode) {
    const isCouponValid = await valdeateCoupon(couponCode, userId);

    if (isCouponValid.error) {
      return next(
        new ErrorClass(isCouponValid.massage, 400, isCouponValid.massage)
      );
    }

    coupon = isCouponValid.coupon;
    total = applyCoupon(subTotal, coupon);
  }

  if (!address && !addressId) {
    return next(
      new ErrorClass("Address is required", 400, "Address is required")
    );
  }

  if (addressId) {
    // check if addressId is valid
    const addressInfo = await Address.findOne({ _id: addressId, userId });

    if (!addressInfo) {
      return next(
        new ErrorClass("Address not found", 400, "Address not found")
      );
    }
  }

  let orderStatus = OrderStatus.PENDING;
  if (PaymentMethods === PaymentMethods.CASH) {
    orderStatus = OrderStatus.PLACED;
  }

  const orderObj = new Order({
    userId,
    products: cart.products,
    address,
    addressId,
    contactNumber,
    subTotal,
    shippingFee,
    VAT,
    couponId: coupon?._id,
    total,
    paymentMethod,
    orderStatus,
    estimatedDeliveryDate: DateTime.now()
      .plus({ days: 7 })
      .toFormat("yyyy-MM-dd"),
  });

  await orderObj.save();

  cart.products = [];
  await cart.save();

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: orderObj,
  });
};

/**
 * @api {PUT} /orders/cancel/:orderId  cancel order
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns {status: string, message: string, data: object}
 */

export const cancelOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const { orderId } = req.params;

  // get order data
  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: {
      $in: [OrderStatus.PENDING, OrderStatus.PLACED, OrderStatus.CONFIRMED],
    },
  });

  if (!order) {
    return next(new ErrorClass("order not found", 404, "order not found"));
  }
  // check if order bought before 3 days
  const orderDate = DateTime.fromJSDate(order.createdAt);
  const nowDate = DateTime.now();
  const diff = Math.ceil(
    Number(nowDate.diff(orderDate, "days").toObject().days).toFixed(2)
  );

  if (diff > 3) {
    return next(
      new ErrorClass(
        "can not cancel order after 3 days",
        400,
        "can not cancel order after 3 days"
      )
    );
  }

  // update orderStatus to cancelled

  order.orderStatus = OrderStatus.CANCELLED;
  order.cancelledAt = DateTime.now();
  order.canceledBy = userId;

  await Order.updateOne({ _id: orderId }, order);
  // update product model

  for (const product of order.products) {
    await Product.updateOne(
      { _id: product.productId },
      { $inc: { stock: product.quantity } }
    );
  }

  res.status(200).json({
    status: "success",
    message: "Order cancelled successfully",
    data: order,
  });
};

/**
 * @api {PUT} /orders/delivered/:orderId  delivered order
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns {status: string, message: string, data: object}
 */

export const deliveredOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const { orderId } = req.params;

  // get order data
  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: { $in: [OrderStatus.PLACED, OrderStatus.CONFIRMED] },
  });

  if (!order) {
    return next(new ErrorClass("order not found", 404, "order not found"));
  }

  // update orderStatus to delivered
  order.orderStatus = OrderStatus.DELIVERED;
  order.deliveredAt = DateTime.now();

  await Order.updateOne({ _id: orderId }, order);

  res.status(200).json({
    status: "success",
    message: "Order delivered successfully",
    data: order,
  });
};

/**
 * @api {GET} /orders/ list order
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns {status: string, message: string, data: object}
 */

export const listOrder = async (req, res, next) => {
  const userId = req.authUser._id;

  const orders = await Order.paginate(
    { userId },
    {
      populate: {
        path: "products.productId",
        select: "title Images rating appliedPrice",
      },
    }
  );
  res.status(200).json({
    status: "success",
    message: "Orders fetched successfully",
    data: orders,
  });
};

/**
 * @api {POST} /orders/stripePay/:orderId  payment with stripe
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns {status: string, message: string, data: object}
 */
export const paymentWithStripe = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.authUser._id;
  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: OrderStatus.PENDING
  })

  if (!order) {
    return next(new ErrorClass("order not found", 404, "order not found"));
  }

  const paymentObject = {
    customer_email: req.authUser.email,
    metadata: {orderId: order._id.toString()},
    discounts: [],
    line_items: order.products.map((product) => {
      return {
        price_data: {
          currency: "egp",
          unit_amount: product.price * 100,
          product_data: {
            name: req.authUser.username
          }
        },
        quantity: product.quantity
      }
    })
  }

  if (order.couponId) {
    const stripeCoupon = await createStripeCoupon({couponId: order.couponId});

    if (stripeCoupon.status) {
      return next(new ErrorClass(stripeCoupon.message, 400, stripeCoupon.message));
    }
    paymentObject.discounts.push({
      coupon: stripeCoupon.id
    })
  }

  const checkoutSession = await createCheckoutSession(paymentObject)
  const paymentIntent = await createIntent({amount: order.total, currency: "egp"})

  order.payment_intent = paymentIntent.id
  await Order.updateOne({ _id: orderId }, order, {new: true})

  res.status(200).json({
    status: "success",
    message: "Payment created successfully",
    data: {
      checkoutSession,
      paymentIntent
    },
    
  })
}

/**
 * @webhook 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns { message: string }
 */

export const stripeWebhookLocal = async (req, res, next) => {
  const orderId = req.body.data.object.metadata.orderId;
  
  const confirmedOrder = await Order.findByIdAndUpdate(orderId, {
    orderStatus: OrderStatus.CONFIRMED
  })
  
  const confirmedPaymentIntent = await confirm({paymentIntentId: confirmedOrder.payment_intent})

  res.status(200).json({
    message: "Payment received",
  })
}

/**
 * @webhook 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns { message: string }
 */

export const refundPaymentStripe = async (req, res, next) => {
  const {orderId} = req.params;

  const order = await Order.findOne({
    _id: orderId,
    orderStatus: OrderStatus.CONFIRMED
  });
  if (!order) {
    return next(new ErrorClass("order not found", 404, "order not found"));
  }

  const refund = await refundPayment({paymentIntentId: order.payment_intent})

  order.orderStatus = OrderStatus.REFUNDED
  await Order.updateOne({ _id: orderId }, order, {new: true})

  for(const product of order.products) {
    await Product.updateOne({ _id: product.productId }, {$inc: {stock: product.quantity}})
  }

  res.status(200).json({
    message: "Payment refunded",
    data: {
      refund,
      order
    }
  })
}