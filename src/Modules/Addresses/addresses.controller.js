import { Address } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";

/**
 * @api {POST} /addresses/add    Add a new Address
 */

export const addAddress = async (req, res, next) => {
  const {
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    setAsDefault,
  } = req.body;

  const { _id } = req.authUser;

  // TODO: cities validation

  // creat address instance
  const addressInstance = new Address({
    userId: _id,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    isDefault: [true, false].includes(setAsDefault) ? setAsDefault : false,
  });

  // if new address is default, we need to update the old default address to be not default
  if (addressInstance.isDefault) {
    await Address.updateOne(
      { userId: _id, isDefault: true },
      { isDefault: false }
    );
  }

  const newAddress = await addressInstance.save();

  res.status(200).json({
    status: "success",
    message: "Address added successfully",
    data: newAddress,
  });
};

/**
 * @api {PUT} /addresses/update/:addressId    update address
 */

export const updateAddress = async (req, res, next) => {
  const {
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    setAsDefault,
  } = req.body;

  const userId = req.authUser._id;
  const { addressId } = req.params;

  const address = await Address.findOne({
    _id: addressId,
    userId,
    isMarkedAsDeleted: false,
  });

  if (!address) {
    return next(new ErrorClass("Address not found", 404, "Address not found"));
  }

  if (country) address.country = country;
  if (city) address.city = city;
  if (postalCode) address.postalCode = postalCode;
  if (buildingNumber) address.buildingNumber = buildingNumber;
  if (floorNumber) address.floorNumber = floorNumber;
  if (addressLabel) address.addressLabel = addressLabel;
  if ([true, false].includes(setAsDefault)){
    address.isDefault = [true, false].includes(setAsDefault) ? setAsDefault : false;
    await Address.updateOne({ userId, isDefault: true }, { isDefault: false });
  }

  await address.save();
  res.status(200).json({
    status: "success",
    message: "Address updated successfully",
    data: address,
  });
};


/**
 * @api {GET} /addresses/   gat addresses
 */


export const getAddresses = async (req, res, next) => {
  const userId = req.authUser._id;
  const addresses = await Address.find({ userId, isMarkedAsDeleted: false });
  res.status(200).json({
    status: "success",
    message: "Addresses fetched successfully",
    data: addresses,
  });
}

/**
 * @api {PUT} /addresses/soft-delete/:addressId   soft delete address
 */

export const softDeleteAddress = async (req, res, next) => {
  const userId = req.authUser._id;
  const { addressId } = req.params;

  const address = await Address.findByIdAndUpdate(
    { _id: addressId, userId, isMarkedAsDeleted: false},
    {isMarkedAsDeleted: true, isDefault: false},
    { new: true } 
  )

  if (!address) {
    return next(new ErrorClass("Address not found", 404, "Address not found"));
  }

  res.status(200).json({
    message: "Address deleted successfully",
  });
}