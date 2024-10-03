import { Router } from "express";
// controllers
import * as controller from "./coupons.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
import { createCouponSchema } from "./coupons.schema.js";

const couponRouter = Router();
const { errorHandler, auth, validationMiddleware} = Middlewares;

couponRouter.post("/create", auth(), validationMiddleware(createCouponSchema), errorHandler(controller.createCoupon));
export { couponRouter };