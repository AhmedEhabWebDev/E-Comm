import slugify from "slugify";
import { nanoid } from "nanoid";
// utils
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { cloudinaryConfig, uploadFile } from "../../Utils/index.js";
// models
import { Brand, Category, SubCategory } from "../../../DB/Models/index.js";

/**
 * @api {POST} /categories/create  create a  new category
 */
export const createCategory = async (req, res, next) => {
  // destructuring the request body
  const { name } = req.body;

  // Generating category slug
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });

  // Image
  if (!req.file) {
    return next(
      new ErrorClass("Please upload an image", 400, "Please upload an image")
    );
  }
  // upload the image to cloudinary
  const customId = nanoid(4);

  const { secure_url, public_id } = await uploadFile({
    file: req.file.path,
    folder: `${process.env.UPLOADS_FOLDER}/Categories/${customId}`,
  });

  // prepare category object
  const category = {
    name,
    slug,
    Images: {
      secure_url,
      public_id,
    },
    customId,
  };

  // create the category in db
  const newCategory = await Category.create(category);

  // send the response
  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: newCategory,
  });
};

/**
 * @api {GET} /categories Get category by name or id or slug
 */
export const getCategory = async (req, res, next) => {
  const { id, name, slug } = req.query;
  const queryFilter = {};

  // check if the query params are present
  if (id) queryFilter._id = id;
  if (name) queryFilter.name = name;
  if (slug) queryFilter.slug = slug;

  // find the category
  const category = await Category.findOne(queryFilter);

  if (!category) {
    return next(
      new ErrorClass("Category not found", 404, "Category not found")
    );
  }

  res.status(200).json({
    status: "success",
    message: "Category found",
    data: category,
  });
};

/**
 * @api {PUT} /categories/update/:_id  Update a category
 */
export const updateCategory = async (req, res, next) => {
  // get the category id
  const { _id } = req.params;
  // find the category by id
  const category = await Category.findById(_id);
  if (!category) {
    return next(
      new ErrorClass("Category not found", 404, "Category not found")
    );
  }
  // name of the category
  const { name, public_id_new } = req.body;

  if (name) {
    const slug = slugify(name, {
      replacement: "_",
      lower: true,
    });

    category.name = name;
    category.slug = slug;
  }

  //Image
  if (req.file) {
    const splitedPublicId = public_id_new.split(`${category.customId}/`)[1];

    const { secure_url } = await uploadFile({
      file: req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`,
      publicId: splitedPublicId,
    });
    category.Images.secure_url = secure_url;
  }

  // save the category with the new changes
  await category.save();

  res.status(200).json({
    status: "success",
    message: "Category updated successfully",
    data: category,
  });
};

/**
 * @api {DELETE} /categories/delete/:_id  Delete a category
 */
export const deleteCategory = async (req, res, next) => {
  // get the category id
  const { _id } = req.params;

  // delete the category from db
  const category = await Category.findByIdAndDelete(_id);
  if (!category) {
    return next(
      new ErrorClass("Category not found", 404, "Category not found")
    );
  }

  // delete relivant images from cloudinary
  const categoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${category?.customId}`;

  // delere relivant subcategories from db
  const deletedSubCategories = await SubCategory.deleteMany({
    categoryId: _id,
  });
  // check if subcategories are deleted already
  if (deletedSubCategories.deletedCount) {
    // delete the relivant brands from db
    const deletedBrands = await Brand.deleteMany({ categoryId: _id });
    if (deletedBrands.deletedCount) {
      // delete the related products from db
      await Product.deleteMany({ categoryId: _id });
    }
  }

  // delete the folder from cloudinary
  await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
  await cloudinaryConfig().api.delete_folder(categoryPath);

  res.status(200).json({
    status: "success",
    message: "Category deleted successfully",
  });
};
