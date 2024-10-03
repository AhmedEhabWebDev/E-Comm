import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const addressSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  buildingNumber: {
    type: Number,
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  addressLabel: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  isMarkedAsDeleted: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
});

export const Address = 
  mongoose.models.Address || model("Address", addressSchema)