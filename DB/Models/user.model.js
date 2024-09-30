import { hashSync } from "bcrypt";
import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["Admin", "Buyer"],
    },
    age : {
      type: Number,
      required: true
    },
    gender : {
      type: String,
      enum: ["male", "female"]
    },
    phone: {
      type: String,
      required: false
    },
    isEmailVerified : {
      type: Boolean,
      default: false,
    },
    isMarkedAsDeleted : {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = hashSync(this.password, +process.env.SALT_ROUNDS);
    next();
  };
});

export const User = 
  mongoose.models.User || model("User", userSchema);