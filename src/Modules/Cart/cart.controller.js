// models
import { Product, Cart } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";
import { checkProductStock } from "./Utils/cart.utils.js";

/**
 * @api {POST} /carts/add    Add to cart
 */

export const addToCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { quantity } = req.body;
  const { productId } = req.params;

  const product = await checkProductStock(productId, quantity);

  if (!product) {
    return next(
      new ErrorClass("Product Not Available", 404, "Product Not Available")
    );
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    // const subTotal = product.appliedPrice * quantity;
    const newCart = new Cart({
      userId,
      products: [
        {
          productId: product._id,
          quantity,
          price: product.appliedPrice,
        },
      ],
      subTotal,
    });

    await newCart.save();
    return res
      .status(201)
      .json({
        status: "success",
        message: "Product Added To Cart",
        data: newCart,
      });
  }

  const isProductExist = cart.products.find((p) => p.productId == productId);
  if (isProductExist) {
    return next(
      new ErrorClass("Product Already In Cart", 400, "Product Already In Cart")
    );
  }

  cart.products.push({
    productId: product._id,
    quantity,
    price: product.appliedPrice,
  });
  // cart.subTotal += product.appliedPrice * quantity;

  await cart.save();
  return res
    .status(200)
    .json({ status: "success", message: "Product Added To Cart", data: cart });
};
/**
 * @api {PUT} /carts/remove    Remove From cart
 */

export const removeFromCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId, "products.productId": productId });

  if (!cart) {
    return next(
      new ErrorClass("Product Not In Cart", 404, "Product Not In Cart")
    );
  }

  cart.products = cart.products.filter(p => p.productId != productId);

  if (cart.products.length === 0) {
    await Cart.deleteOne({ userId });
    return res.status(200).json({message: 'Product Removed From Cart'})
  }

  // cart.subTotal = 0

  // cart.products.forEach(p => {
  //   cart.subTotal += p.price * p.quantity
  // })

  await cart.save()

  res.status(200).json({message: 'Product Removed From Cart', cart})
};

/**
 * @api {PUT} /carts/update     update cart
 */

export const updateCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ userId, "products.productId": productId });

  if (!cart) {
    return next(
      new ErrorClass("Product Not In Cart", 404, "Product Not In Cart")
    );
  }

  const product = await checkProductStock(productId, quantity);
  if (!product) {
    return next(
      new ErrorClass("Product Not available", 404, "Product Not available")
    );
  }

  const productIndex = cart.products.findIndex(p => p.productId.toString() == product._id.toString());
  cart.products[productIndex].quantity = quantity;

  // cart.subTotal = 0

  // cart.products.forEach(p => {
  //   cart.subTotal += p.price * p.quantity
  // })

  await cart.save()

  res.status(200).json({message: 'Product Updated', cart})
}

/**
 * @api {GET} /carts/    Get carts
 */

export const getCart = async (req, res, next) => {
  const userId = req.authUser._id;

  const cart = await Cart.findOne({ userId });

  res.status(200).json({ cart });
}