import { Router } from "express";
// controllers
import * as controller from "./coupons.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
import { createCouponSchema, updateCouponSchema } from "./coupons.schema.js";

const couponRouter = Router();
const { errorHandler, auth, validationMiddleware} = Middlewares;

couponRouter.post("/create", auth(), validationMiddleware(createCouponSchema), errorHandler(controller.createCoupon));

couponRouter.get("/", errorHandler(controller.getCoupons));

couponRouter.get("/details/:couponId", errorHandler(controller.getCouponById));

couponRouter.put("/update/:couponId", auth(), validationMiddleware(updateCouponSchema),errorHandler(controller.updateCoupon));

couponRouter.patch("/enable/:couponId", auth(), errorHandler(controller.enableOrDisableCoupon))
export { couponRouter };