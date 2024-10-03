import { Router } from "express";
// controllers
import * as controller from "./addresses.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
import { auth } from "../../Middlewares/authentication.middleware.js";

const addressRouter = Router();
const { errorHandler } = Middlewares;

addressRouter.post("/add", auth(), errorHandler(controller.addAddress));

addressRouter.put("/update/:addressId", auth(), errorHandler(controller.updateAddress));

addressRouter.put("/soft-delete/:addressId", auth(), errorHandler(controller.softDeleteAddress));

addressRouter.get("/", auth(), errorHandler(controller.getAddresses));
export { addressRouter };