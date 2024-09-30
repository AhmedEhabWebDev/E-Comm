import { Router } from "express";
// controllers
import * as controller from "./categories.controller.js";
// utils
import { extensions } from "../../Utils/index.js";
// middlewares
import * as middlewares from "../../Middlewares/index.js";
// models
import { Category } from "../../../DB/Models/index.js";

// get the required middlewares
const { errorHandler, getDocumentByName, multerHost } = middlewares;

const categoryRouter = Router();

// routes
categoryRouter.post(
  "/create",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(Category),
  errorHandler(controller.createCategory)
);

categoryRouter.get("/", errorHandler(controller.getCategory));

categoryRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(Category),
  errorHandler(controller.updateCategory)
);

categoryRouter.delete("/delete/:_id", errorHandler(controller.deleteCategory));

categoryRouter.get("/list", errorHandler(controller.listCategories));
export { categoryRouter };
