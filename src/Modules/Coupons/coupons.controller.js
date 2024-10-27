import { Coupon, CouponChangesLog, User } from "../../../DB/Models/index.js";
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

export const getCoupons = async (req, res, next) => {
    const { isEnable } = req.query;
    const filters = {}

    if (isEnable) {
      filters.isEnable = isEnable === "true"? true : false;
    }

    const coupons = await Coupon.find(filters);
    res.status(200).json({
      status: "success",
      message: "Coupons fetched successfully",
      data: coupons
    })
  }

/**
 * @api {GET} /coupons/:couponId     GET coupon by id
 */

export const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(new ErrorClass("Coupon not found", 404, "Coupon not found"));
  }
  res.status(200).json({
    status: "success",
    message: "Coupon fetched successfully",
    data: coupon
  })
}

/**
 * @api {PUT} /coupons/:couponId    Update coupon
 */


export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const userId = req.authUser._id;
  const { couponCode, couponAmount, couponType, from, till, Users } = req.body;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(new ErrorClass("Coupon not found", 404, "Coupon not found"));
  }


  const logUpdatedObject = {couponId, updatedBy: userId, changes: {}};
  if (couponCode) {
    const isCouponExist = await Coupon.findOne({ couponCode });
    if (isCouponExist) {
      return next(new ErrorClass("Coupon code already exist", 400, "Coupon code already exist"));
    }

    coupon.couponCode = couponCode;
    logUpdatedObject.changes.couponCode = couponCode;
  }

  if (couponAmount) {
    coupon.couponAmount = couponAmount;
    logUpdatedObject.changes.couponAmount = couponAmount;
  }

  if (couponType) {
    coupon.couponType = couponType;
    logUpdatedObject.changes.couponType = couponType;
  }

  if (from) {
    coupon.from = from;
    logUpdatedObject.changes.from = from;
  }

  if (till) {
    coupon.till = till;
    logUpdatedObject.changes.till = till;
  }

  if (Users) {
    const userIds = Users.map(u => u.userId);
    const validUsers = await User.find({ _id: { $in: userIds } });
    if (validUsers.length !== userIds.length) {
      return next(new ErrorClass("Invalid user", 400, "Invalid user"));
    }
  }

  await coupon.save();
  const logs = await new CouponChangesLog(logUpdatedObject).save();

  res.status(200).json({
    status: "success",
    message: "Coupon updated successfully",
    data: {coupon, logs}
  })
}

/**
 * @api {PATCH} /coupons/:couponId    Disable or Enable coupon
 */

export const enableOrDisableCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const userId = req.authUser._id;
  const { enable } = req.body;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    return next(new ErrorClass("coupon not found", 404, "coupon not found"))
  }

  const logUpdatedObject = {couponId, updatedBy: userId, changes: {}};
  
  if (enable === true) {
    coupon.isEnable = true;
    logUpdatedObject.changes.isEnable = true;
  }

  if (enable === false) {
    coupon.isEnable = false;
    logUpdatedObject.changes.isEnable = false;
  }

  await coupon.save()
  const logs = await new CouponChangesLog(logUpdatedObject).save();

  res.status(200).json({
    status: "success",
    message: "Coupon updated successfully",
    data: {coupon, logs}
  })
}

