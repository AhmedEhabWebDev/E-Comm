import { Router } from "express";
// controllers
import * as controller from "./cart.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
import { auth } from "../../Middlewares/authentication.middleware.js";

const cartRouter = Router();
const { errorHandler } = Middlewares;

cartRouter.post("/add/:productId", auth(), errorHandler(controller.addToCart));

cartRouter.put("/remove/:productId", auth(), errorHandler(controller.removeFromCart));

cartRouter.put("/update/:productId", auth(), errorHandler(controller.updateCart));

cartRouter.get("/", auth(), errorHandler(controller.getCart));
export { cartRouter };