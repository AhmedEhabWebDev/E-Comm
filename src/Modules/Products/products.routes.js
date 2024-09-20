import { Router } from "express";
// controllers
import * as controller from "./products.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
// utils
import { extensions } from "../../Utils/index.js";
// models
import { Brand } from "../../../DB/Models/index.js";

const productRouter = Router();
const { errorHandler, multerHost, checkIfIdsExit } = Middlewares;

productRouter.post(
  "/add",
  multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
  checkIfIdsExit(Brand),
  errorHandler(controller.addProduct)
);

productRouter.put("/update/:productId", errorHandler(controller.updateProduct));

productRouter.get("/list", errorHandler(controller.listProducts));
export { productRouter };
