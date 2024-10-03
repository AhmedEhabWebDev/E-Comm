import { Coupon, User } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";

/**
 * @api {POST} /coupons/create    Create coupon
 */


export const createCoupon = async (req, res, next) => {
  const { couponCode, couponAmount, couponType, from, till, Users } = req.body;
  const createdBy = req.authUser._id;

  // coupon check

  const isCouponCodeExist = await Coupon.findOne({ couponCode });

  if (isCouponCodeExist) {
    return next(new ErrorClass("Coupon code already exist", 400, "Coupon code already exist"));
  }

  const userIds = Users.map(u => u.userId);
  const validUsers = await User.find({ _id: { $in: userIds } });
  if (validUsers.length !== userIds.length) {
    return next(new ErrorClass("Invalid user", 400, "Invalid user"));
  }

  const coupon = new Coupon({
    couponCode,
    couponAmount,
    couponType,
    from,
    till,
    Users,
    createdBy
  });
  
  await coupon.save();
  res.status(201).json({
    status: "success",
    message: "Coupon created successfully",
    data: coupon
  })
};

/**
 * @api {GET} /coupons/    Get All coupons
 */


/**
 * @api {GET} /coupons/:couponId     GET coupon by id
 */


/**
 * @api {PUT} /coupons/:couponId    Update coupon
 */


/**
 * @api {DELETE} /coupons/:couponId    Delete coupon
 */


/**
 * @TODO add apply coupon API after creating Order
 * @api {POST} /coupons/apply    Apply coupon
 */
