import { DateTime } from "luxon";
import { Coupon } from "../../../../DB/Models/index.js";
import { couponType, DiscountType } from "../../../Utils/index.js";

/**
 * @param {*} couponCode
 * @param {*} userId
 * @returns { massage: string, error: Boolean, coupon: Object }
 */

export const valdeateCoupon = async (couponCode, userId) => {
  const coupon = await Coupon.findOne({ couponCode });
  if (!coupon) {
    return { massage: "invalid Coupon code", error: true };
  }

  // check coupon is enable
  if (!coupon.isEnable || DateTime.now() > DateTime.fromJSDate(coupon.till)) {
    return { massage: "Coupon is expired", error: true };
  }

  // check if coupon not started yet
  if (DateTime.now() < DateTime.fromJSDate(coupon.from)) {
    return {
      massage: `Coupon is not started yet, will started on ${coupon.from}`,
      error: true,
    };
  }

  // check if user not eligible to use coupon
  const isUserNotEligible = coupon.Users.some(
    (u) =>
      u.userId.toString() !== userId.toString() ||
      (u.userId.toString() === userId.toString() && u.maxCount <= u.usageCount)
  );
  console.log({ isUserNotEligible });

  if (isUserNotEligible) {
    return {
      massage:
        "User is not eligible to use this coupon or you reedem all your tries",
      error: true,
    };
  }
  
  return { error: false, coupon };
};



export const applyCoupon = (subTotal, coupon) => {
  let total = subTotal;
  const { couponAmount: discountAmount, couponType: discountType } = coupon;
 
  if (discountAmount && discountType) {0
    if (discountType == couponType.PERCENTAGE) {
      total = subTotal - (subTotal * discountAmount) / 100;
    } else if (discountType === couponType.AMOUNT) {
      if (discountAmount > subTotal) {
        return total;
      }
      total = subTotal - discountAmount;
    }
  }
  return total;
};
