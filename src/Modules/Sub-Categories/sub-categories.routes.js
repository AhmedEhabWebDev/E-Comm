import { Router } from "express";
// controllers
import * as controller from "./sub-categories.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
// models
import { SubCategory } from "../../../DB/Models/index.js";
// utils
import { extensions } from "../../Utils/index.js";

const subCategoryRouter = Router();
const { errorHandler, getDocumentByName , multerHost } = Middlewares;

subCategoryRouter.post(
  "/create",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(SubCategory),
  errorHandler(controller.createSubCategory)
);


subCategoryRouter.get("/", errorHandler(controller.getSubCategory));

subCategoryRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(SubCategory),
  errorHandler(controller.updateSubCategory)
);

subCategoryRouter.delete("/delete/:_id", errorHandler(controller.deleteSubCategory));

export { subCategoryRouter };
