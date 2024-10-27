import { Order, Product, Review } from "../../../DB/Models/index.js";
import { ErrorClass, OrderStatus, ReviewStatus } from "../../Utils/index.js";

/**
 * @api {POST} /reviews/add    Add a new review
 */

export const addReview = async (req, res, next) => {
  // destructuring the request body
  const { rating, comment, productId } = req.body;
  const userId = req.authUser._id;

  // check if user already reviewed this product
  const isAlreadyreviewed = await Review.findOne({ userId, productId });
  if (isAlreadyreviewed) {
    return next(
      new ErrorClass(
        "you have Already reviewed",
        400,
        "you have Already reviewed"
      )
    );
  }

  // check if product exist
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorClass("product not found", 404, "product not found"));
  }

  // check if user bought this product
  const order = await Order.findOne({
    userId,
    "products.productId": productId,
    orderStatus: OrderStatus.DELIVERED,
  });
  if (!order) {
    return next(
      new ErrorClass(
        "you have not bought this product",
        400,
        "you have not bought this product"
      )
    );
  }

  const newReview = new Review({
    userId,
    productId,
    reviewRating: rating,
    reviewBody: comment
  });

  await newReview.save();
  res.status(201).json({ 
    status: "success",
    message: "review added successfully", 
    review: newReview 
  });
};

/**
 * @api {PUT} /reviews/accepted-rejected/:reviewId    Update reviewStatus
 */

export const updateReviewStatus = async (req, res, next) => {
  // destructuring the request body
  const { reviewId } = req.params;
  const { reviewStatus } = req.body;

  // check if review exist
  const review = await Review.findByIdAndUpdate(reviewId, {
    reviewStatus: reviewStatus === ReviewStatus.ACCEPTED ? ReviewStatus.ACCEPTED : ReviewStatus.REJECTED,
  }, { new: true });

  if (!review) {
    return next(new ErrorClass("review not found", 404, "review not found"));
  }
  
  res.status(200).json({ 
    status: "success",
    message: "review status updated successfully", 
    review: review 
  });
}

/**
 * @api {GET} /reviews/    Get reviews
 */

export const listReviews = async (req, res, next) => {
  // find all reviews
  const reviews = await Review.find().populate([
    {
      path: "userId",
      select: "username email -_id"
    },
    {
      path: "productId",
      select: "title rating -_id"
    }
  ]);

  res.status(200).json({ 
    status: "success",
    message: "reviews fetched successfully", 
    reviews: reviews 
  });
}