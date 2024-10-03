import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const cartSchema = new Schema({
  userId : {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  subTotal: Number

}, { timestamps: true });

export const Cart = mongoose.models.Cart || model("Cart", cartSchema)