// Utils
import { couponType } from "../../src/Utils/index.js";
// global setup
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const couponSchema = new Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true
  },
  couponAmount: {
    type: Number,
    required: true
  },
  couponType: {
    type: String,
    required: true,
    enum: Object.values(couponType)
  },
  from: {
    type: Date,
    required: true
  },
  till: {
    type: Date,
    required: true
  },
  Users: [
    {
      userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      maxCount: {
        type: Number,
        required: true,
        min: 1
      },
      usageCount: {
        type: Number,
        default: 0
      }
    }
  ],
  isEnable: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });


export const Coupon = mongoose.models.Coupon || model("Coupon", couponSchema)

// creat coupon changes log model
// couponId, userId, changes: {}

const couponChangesLogSchema = new Schema({
  couponId: {
    type: Schema.Types.ObjectId,
    ref: "Coupon",
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  changes: {
    type: Object,
    required: true
  }
}, { timestamps: true });

export const CouponChangesLog = mongoose.models.CouponChangesLog || model("CouponChangesLog", couponChangesLogSchema);