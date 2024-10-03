import Joi from "joi";
import { couponType, generalRules } from "../../Utils/index.js";

export const createCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required(),
    from: Joi.date().greater(Date.now()).required(),
    till: Joi.date().greater(Joi.ref("from")).required(),
    Users: Joi.array().items(Joi.object({
      userId: generalRules._id.required(),
      maxCount: Joi.number().min(1).required()
    })).required(),
    couponType: Joi.string().valid(...Object.values(couponType)).required(),
    couponAmount: Joi.number().when('couponType', {
      is: Joi.string().valid(couponType.PERCENTAGE),
      then: Joi.number().max(100).required()
    }).min(1).required().messages({
      'number.min': 'Coupon amount must be greater than 0',
      'number.max': 'Coupon amount must be less than or equal to 100'
    }),
  })
}