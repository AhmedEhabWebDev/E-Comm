import { Router } from "express";
// controllers
import * as controller from "./reviews.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";

const reviewRouter = Router();
const { errorHandler, auth } = Middlewares;

reviewRouter.post("/add", auth(), errorHandler(controller.addReview));

reviewRouter.put("/accepted-rejected/:reviewId", errorHandler(controller.updateReviewStatus));

reviewRouter.get("/", errorHandler(controller.listReviews));
export { reviewRouter };