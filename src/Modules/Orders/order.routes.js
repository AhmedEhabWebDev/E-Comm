import { Router } from "express";
// controllers
import * as controller from "./order.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";

const orderRouter = Router();
const { errorHandler, auth } = Middlewares;

orderRouter.post("/create", auth(), errorHandler(controller.createOrder));

orderRouter.put("/cancel/:orderId", auth(), errorHandler(controller.cancelOrder));

orderRouter.put("/delivered/:orderId", auth(), errorHandler(controller.deliveredOrder));

orderRouter.get("/", auth(), errorHandler(controller.listOrder));

orderRouter.post("/stripePay/:orderId", auth(), errorHandler(controller.paymentWithStripe));

orderRouter.post("/webhook", errorHandler(controller.stripeWebhookLocal));

orderRouter.post("/refund/:orderId", auth(), errorHandler(controller.refundPaymentStripe));
export { orderRouter };