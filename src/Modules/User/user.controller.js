import jwt from "jsonwebtoken";
import { compareSync, hashSync } from "bcrypt";
import { Address, User } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";


/**
 * @api {POST} /user/register Register a new user
 */

export const registerUser = async (req, res, next) => {
  const { username, email, password, gender, age, phone, userType, country, city, postalCode, buildingNumber, floorNumber, addressLabel, isDefault, isMarkedAsDeleted } = req.body;

  // check email
  const isEmailExist = await User.findOne({ email });

  if (isEmailExist) {
    return next( new ErrorClass("Email already exist", 400,"Email already exist"));
  }

  // create User Instance
  const userInstance = new User({
    username,
    email,
    password,
    gender,
    age,
    phone,
    userType
  })

  // create Address Instance
  const addressInstance = new Address({
    userId: userInstance._id,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    isDefault: true
  })

  // creat user in db
  const newUser = await userInstance.save();

  // create address in db
  const sevedAddress = await addressInstance.save();


  res.status(201).json({
    status: "success",
    message: "User created successfully",
    user: newUser,
    address: sevedAddress
  });
};


/**
 * @api {PUT} /user/:_id Update username, pawssword
 */

export const updateUser = async (req, res, next) => {
  const { _id } = req.params;
  const { username, password } = req.body;

// find User by id
  const user = await User.findById(_id);

  if (!user) {
    return next(new ErrorClass("User not found", 404, "User not found"));
  }

  if (password) {
    user.password = password;
  }

  if (username) {
    user.username = username;
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: user,
  });
}

/**
 * @param {object} req
 * @param {object} res
 * @returns {object} return response { message, token }
 * @description User logIn 
 */

export const signIn = async (req, res) => {
  // destruct email and password from req.body
  const { email, password } = req.body;
  // find user
  const user = await User.findOne({ email });
  if (!user)
    return next(new ErrorClass("invalid email or password", 404, "invalid email or password"));

  // compare password
  const isMatch = compareSync(password, user.password);

  if (!isMatch)
    return  next(new ErrorClass("invalid email or password", 404, "invalid email or password"));

  // generate the access token
  const token = jwt.sign({ userId: user._id }, process.env.LOGIN_SECRET);

  // response
  res.status(200).json({
    message: "Login success",
    token
  });
};