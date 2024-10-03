import Joi from "joi";
import mongoose from "mongoose";

const objectValidation = (values, helper) => {
  const isValid = mongoose.isValidObjectId(values);

  if (!isValid) {
    return helper.message("Invalid ID");
  }

  return values;
}

export const generalRules = {
  _id: Joi.string().custom(objectValidation)
}